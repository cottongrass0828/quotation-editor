<template>
    <nav
        class="bg-white border-t border-slate-200 h-16 shrink-0 flex justify-around items-center text-xs font-medium z-10 pb-safe">
        <button @click="$emit('change', 'home')" :class="current === 'home' ? 'text-emerald-600' : 'text-slate-400'"
            class="flex flex-col items-center w-full h-full justify-center">
            <i class="fa-solid fa-list-ul text-lg mb-1"></i>
            清單
        </button>
        <button @click="$emit('change', 'archive')"
            :class="current === 'archive' ? 'text-emerald-600' : 'text-slate-400'"
            class="flex flex-col items-center w-full h-full justify-center">
            <i class="fa-solid fa-box-archive text-lg mb-1"></i>
            封存
        </button>
        <button @click="$emit('change', 'stamps')" :class="current === 'stamps' ? 'text-emerald-600' : 'text-slate-400'"
            class="flex flex-col items-center w-full h-full justify-center">
            <i class="fa-solid fa-stamp text-lg mb-1"></i>
            印章
        </button>
        <button @click="$emit('change', 'settings')"
            :class="current === 'settings' ? 'text-emerald-600' : 'text-slate-400'"
            class="flex flex-col items-center w-full h-full justify-center">
            <i class="fa-solid fa-gear text-lg mb-1"></i>
            設定
        </button>
    </nav>
</template>

<script setup>
defineOptions({
    name: 'NavBar'
})

defineProps(['current']);

defineEmits(['change']);
</script>