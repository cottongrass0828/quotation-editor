<template>
    <div class="space-y-4 p-2">
        <div class="bg-white rounded-xl shadow-sm p-4">
            <h3 class="font-bold text-slate-700 mb-4 text-lg">資料備份與還原</h3>
            <div class="space-y-4">
                <div class="border border-slate-200 rounded-lg p-4">
                    <h4 class="font-medium text-slate-600 mb-2"><i
                            class="fa-solid fa-download mr-2 text-emerald-500"></i> 全部資料匯出</h4>
                    <button @click="$emit('export')"
                        class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold transition-colors">匯出全部資料</button>
                </div>
                <div class="border border-slate-200 rounded-lg p-4">
                    <h4 class="font-medium text-slate-600 mb-2"><i class="fa-solid fa-upload mr-2 text-blue-500"></i>
                        全部資料匯入</h4>
                    <label
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center cursor-pointer">
                        選擇檔案匯入
                        <input type="file" accept=".json" @change="onImport" class="hidden" />
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// 由於在 template 裡使用了 emit 但又要在 script 裡用，所以需要宣告
import { getCurrentInstance } from 'vue';

defineOptions({
    name: 'SettingsView'
})

defineEmits(['export', 'import']);

const onImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    // 直接將 File 物件傳給上層處理，保持 View 純淨
    // 或者在這裡讀取 FileReader 也可以，這裡選擇在 View 處理讀取邏輯比較方便
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            emit('import', data);
        } catch (err) {
            alert('檔案格式錯誤');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // 重置 input
};

const emit = getCurrentInstance().emit;
</script>