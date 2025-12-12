<template>
    <div class="space-y-4">
        <div class="bg-white p-4 rounded-xl shadow-sm">
            <h3 class="font-bold text-slate-700 mb-3">新增印章</h3>
            <div class="space-y-3">
                <input type="text" v-model="newStampName" placeholder="印章名稱" class="w-full p-2 border rounded" />
                <div
                    class="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                    <input type="file" @change="handleImageUpload" accept="image/*"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div v-if="!newStampImage">
                        <i class="fa-solid fa-cloud-upload-alt text-2xl text-slate-400 mb-1"></i>
                        <p class="text-xs text-slate-500">點擊上傳圖片</p>
                    </div>
                    <img v-else :src="newStampImage" class="max-h-20 mx-auto object-contain" />
                </div>
                <button @click="handleAdd" :disabled="!newStampName || !newStampImage"
                    class="w-full bg-slate-800 text-white py-2 rounded-lg font-bold disabled:opacity-50">新增印章</button>
            </div>
        </div>

        <div class="space-y-3">
            <div v-for="(stamp, index) in stamps" :key="stamp.id"
                class="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <img :src="stamp.image"
                        class="w-12 h-12 object-contain bg-slate-50 rounded border border-slate-100" />
                    <span class="font-bold text-slate-700">{{ stamp.name }}</span>
                </div>
                <button @click="$emit('delete', index)" class="text-red-400 hover:text-red-600 p-2"><i
                        class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
    name: 'StampsView'
})

const props = defineProps(['stamps']);

const emit = defineEmits(['add', 'delete']);

const newStampName = ref("");
const newStampImage = ref(null);

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { newStampImage.value = e.target.result; };
    reader.readAsDataURL(file);
};

const handleAdd = () => {
    emit('add', { id: Date.now(), name: newStampName.value, image: newStampImage.value });
    newStampName.value = "";
    newStampImage.value = null;
};
</script>