<template>
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-[-10px]">
        <div v-if="show"
            class="fixed top-20 right-4 bg-slate-800/90 backdrop-blur text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
            <i class="fa-solid fa-cloud-arrow-up text-emerald-400"></i>
            <span>已自動儲存</span>
        </div>
    </Transition>
</template>

<script setup>
defineOptions({
    name: 'AutoSaveNotify'
})


defineProps(['show']);
</script>