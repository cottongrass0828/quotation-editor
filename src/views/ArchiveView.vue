<template>
    <div class="space-y-4">
        <div v-if="archivedQuotations.length === 0" class="text-center py-10 text-slate-400">
            <i class="fa-solid fa-box-open text-4xl mb-3"></i>
            <p>沒有封存的項目</p>
        </div>
        <div v-for="q in archivedQuotations" :key="q.id"
            class="bg-slate-100 p-4 rounded-xl border border-slate-200 opacity-75 grayscale hover:grayscale-0 transition-all">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-slate-700">{{ q.customerCompany }}</h3>
                <span class="text-xs">{{ q.date }}</span>
            </div>
            <div class="flex justify-between items-center mt-3">
                <span class="font-mono font-bold">NT$ {{ formatNumber(q.totalAmount) }}</span>
                <button @click="$emit('restore', q.id)"
                    class="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold">
                    <i class="fa-solid fa-rotate-left"></i> 復原
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatNumber } from '../utils/helpers';

defineOptions({
    name: 'ArchiveView'
})

const props = defineProps(['quotations']);

defineEmits(['restore']);

const archivedQuotations = computed(() => {
    return props.quotations.filter((q) => q.isArchived);
});
</script>