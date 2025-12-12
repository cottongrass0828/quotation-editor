<template>
    <div class="space-y-4">
        <div class="relative">
            <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
            <input type="text" v-model="searchText" placeholder="搜尋公司或客戶..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>

        <div v-if="filteredQuotations.length === 0" class="text-center py-10 text-slate-400">
            <i class="fa-regular fa-folder-open text-4xl mb-3"></i>
            <p>尚無估價單，請點擊下方按鈕新增</p>
        </div>

        <div v-for="q in filteredQuotations" :key="q.id" @click="$emit('edit', q.id)"
            class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 hover:shadow-md transition-shadow cursor-pointer active:scale-95 duration-100">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-slate-800 text-lg">
                    {{ q.customerCompany || '未命名公司' }}
                </h3>
                <span class="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{{ q.date }}</span>
            </div>
            <div class="flex justify-between items-center text-sm text-slate-500">
                <span><i class="fa-solid fa-user mr-1"></i> {{ q.customerName || '未填寫' }}</span>
                <span class="font-bold text-emerald-600 text-base">NT$ {{ formatNumber(q.totalAmount) }}</span>
            </div>
        </div>

        <button @click="$emit('create')"
            class="fixed bottom-24 right-4 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-transform active:scale-90 z-20">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatNumber } from '../utils/helpers';
defineOptions({
    name: 'HomeView'
})

const props = defineProps(['quotations']);

defineEmits(['create', 'edit']);

const searchText = ref("");

const filteredQuotations = computed(() => {
    let list = props.quotations.filter(q => !q.isArchived);
    if (searchText.value) {
        const low = searchText.value.toLowerCase();
        list = list.filter(q =>
            (q.customerCompany || "").toLowerCase().includes(low) ||
            (q.customerName || "").toLowerCase().includes(low)
        );
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
});
</script>