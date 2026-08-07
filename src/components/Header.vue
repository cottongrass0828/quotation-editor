<template>
    <header class="header-safe-top bg-white p-4 shadow-sm z-10 flex justify-between items-center h-16 shrink-0">
        <h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-file-invoice-dollar text-emerald-500"></i>
            {{ title }}
        </h1>
        <div>
            <span class="text-slate-300 text-xs mr-2">v{{ version }}</span>
            <button v-if="showClose" @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>
    </header>
</template>

<script setup>
defineOptions({
    name: 'Header'
})

defineProps({
    title: String,
    version: String,
    showClose: Boolean
});

defineEmits(['close']);
</script>

<style scoped>
/* Android 狀態列 (status bar) 安全區域，Web/PWA 環境 env() 無值時不影響版面 */
.header-safe-top {
    padding-top: max(1rem, calc(1rem + env(safe-area-inset-top)));
}
</style>