<template>
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="show"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            @click.self="$emit('close')">
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 space-y-4 relative overflow-hidden">

                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold text-slate-800">估價單預覽</h3>
                    <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <div class="bg-slate-100 rounded-lg p-2 flex justify-center items-center min-h-[200px]">
                    <img v-if="imageUrl" :src="imageUrl" alt="估價單預覽"
                        class="max-w-full max-h-[60vh] object-contain shadow-sm rounded border border-slate-200" />
                    <div v-else class="text-slate-400 flex flex-col items-center">
                        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                        Generating...
                    </div>
                </div>

                <div class="space-y-2">
                    <button v-if="canShare" @click="handleShare"
                        class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-200 active:scale-95">
                        <i class="fa-solid fa-share-nodes"></i>
                        分享圖片 (LINE)
                    </button>

                    <a v-if="!isNative" :href="imageUrl" :download="fileName"
                        class="block text-center w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors active:scale-95">
                        <i class="fa-solid fa-download mr-1"></i>
                        下載到相簿
                    </a>
                    <button v-else @click="handleDownload"
                        class="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors active:scale-95">
                        <i class="fa-solid fa-download mr-1"></i>
                        下載到相簿
                    </button>
                </div>
                <p class="text-xs text-center text-slate-400">
                    小提示：如果分享失敗，您可以點擊下載，或直接長按上方圖片進行儲存。
                </p>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Media } from '@capacitor-community/media';

defineOptions({
    name: 'ImagePreviewModal'
})

const props = defineProps(['show', 'imageUrl', 'fileName', 'companyName']);

const emit = defineEmits(['close']);

const isNative = Capacitor.isNativePlatform();

// Android WebView 不支援 navigator.share，原生環境一律視為可分享
const canShare = computed(() => {
    if (isNative) return true;
    return !!(navigator.share && navigator.canShare);
});

// dataURL 轉純 base64（去除 data:image/png;base64, 前綴），供 Filesystem 寫檔使用
const toBase64 = (dataUrl) => dataUrl.split(',')[1];

const handleShare = async () => {
    if (!props.imageUrl) return;

    if (isNative) {
        const path = props.fileName || 'quotation.png';
        try {
            await Filesystem.writeFile({ path, data: toBase64(props.imageUrl), directory: Directory.Cache });
            const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
            await Share.share({
                title: '估價單',
                text: `這是${props.companyName}的估價單，請查收。`,
                url: uri,
            });
        } catch (error) {
            console.error('分享失敗:', error);
            alert('分享失敗，請嘗試使用下載按鈕。');
        } finally {
            // 分享後清除暫存檔，避免快取殘留累積
            await Filesystem.deleteFile({ path, directory: Directory.Cache }).catch(() => { });
        }
        return;
    }

    try {
        // 1. 將 Data URL 轉換為 Blob 物件
        const response = await fetch(props.imageUrl);
        const blob = await response.blob();

        // 2. 建立 File 物件
        const file = new File([blob], props.fileName || 'quotation.png', { type: blob.type });

        // 3. 檢查是否能分享此檔案
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            // 4. 呼叫系統分享
            await navigator.share({
                title: '估價單',
                text: `這是${props.companyName}的估價單，請查收。`,
                files: [file],
            });
        } else {
            throw new Error('您的瀏覽器不支援檔案分享。');
        }
    } catch (error) {
        console.error('分享失敗:', error);
        // 如果是使用者取消分享，通常不需要跳錯誤提示
        if (error.name !== 'AbortError') {
            alert('分享失敗，請嘗試使用下載按鈕，或長按圖片儲存。');
        }
    }
};

// Android 端 Media.savePhoto 必須指定相簿，找不到就建立一個專用相簿，並回傳其 identifier
const ALBUM_NAME = '專業估價單助手';
const ensureAlbum = async () => {
    const { albums } = await Media.getAlbums();
    const existing = albums.find((a) => a.name === ALBUM_NAME);
    if (existing) return existing.identifier;

    await Media.createAlbum({ name: ALBUM_NAME }).catch(() => { }); // 若剛好已存在（競態）就忽略錯誤
    const { albums: refreshed } = await Media.getAlbums();
    return refreshed.find((a) => a.name === ALBUM_NAME)?.identifier;
};

// 原生環境：WebView 不支援 <a download>，改用 Media.savePhoto 寫入系統相簿
const handleDownload = async () => {
    if (!props.imageUrl) return;
    try {
        const albumIdentifier = await ensureAlbum();
        if (!albumIdentifier) throw new Error('無法建立相簿');
        const fileName = (props.fileName || 'quotation.png').replace(/\.[^.]+$/, '');
        await Media.savePhoto({ path: props.imageUrl, albumIdentifier, fileName });
        alert('已儲存至「相簿 / Photos」。');
    } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗，請稍後再試。');
    }
};
</script>