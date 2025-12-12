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

                    <a :href="imageUrl" :download="fileName"
                        class="block text-center w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors active:scale-95">
                        <i class="fa-solid fa-download mr-1"></i>
                        下載到相簿
                    </a>
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

defineOptions({
    name: 'ImagePreviewModal'
})

const props = defineProps(['show', 'imageUrl', 'fileName', 'companyName']);

const emit = defineEmits(['close']);

// 檢查瀏覽器是否支援 Web Share API 且能分享檔案
const canShare = computed(() => {
    return navigator.share && navigator.canShare;
});

const handleShare = async () => {
    if (!props.imageUrl) return;

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
</script>