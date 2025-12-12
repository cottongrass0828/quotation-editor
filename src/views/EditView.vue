<template>
    <div class="space-y-4">
        <AutoSaveNotify :show="showAutoSaveNotify" />

        <ImagePreviewModal :show="showPreviewModal" :image-url="previewImageUrl" :file-name="previewFileName"
            :company-name="previewCustomerCompany" @close="showPreviewModal = false" />

        <div class="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <div class="font-bold text-slate-800 mb-3">估價單明細</div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">客戶公司名稱</label>
                <input type="text" v-model="localData.customerCompany"
                    class="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none transition-colors"
                    placeholder="輸入公司名稱" />
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                    <label class="block text-xs font-bold text-slate-500 mb-1">日期</label>
                    <input type="date" v-model="localData.date"
                        class="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1">客戶名稱 (To:)</label>
                    <input type="text" v-model="localData.customerName"
                        class="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none" />
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">選擇印章圖檔</label>
                <select v-model="localData.stampId"
                    class="w-full p-2 border border-slate-200 rounded bg-white focus:border-emerald-500 outline-none">
                    <option value="">不使用印章</option>
                    <option v-for="stamp in stamps" :key="stamp.id" :value="stamp.id">{{ stamp.name }}</option>
                </select>
            </div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-slate-700">商品明細</h3>
                <button @click="addItem" class="text-emerald-600 text-sm font-bold">
                    <i class="fa-solid fa-plus-circle"></i> 新增項目
                </button>
            </div>
            <div v-for="(item, index) in localData.items" :key="item.id || index"
                class="mb-4 pb-4 border-b border-dashed border-slate-200 last:border-0 last:pb-0 relative animate-fade-in">
                <div class="grid grid-cols-12 gap-2 relative z-10">
                    <div class="text-slate-200 font-black text-4xl select-none opacity-50">{{ index + 1 }}</div>
                    <div class="col-span-10">
                        <input type="text" v-model="item.name" placeholder="品名"
                            class="w-full p-2 bg-slate-50 border-0 rounded text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 placeholder-slate-300" />
                    </div>
                    <div class="col-span-6"><input type="text" v-model="item.spec" placeholder="規格"
                            class="w-full p-1 text-sm border-b border-slate-200 focus:border-emerald-500 outline-none" />
                    </div>
                    <div class="col-span-6"><input type="text" v-model="item.remark" placeholder="備註"
                            class="w-full p-1 text-sm border-b border-slate-200 focus:border-emerald-500 outline-none text-slate-500" />
                    </div>
                    <div class="col-span-2">
                        <label class="text-[10px] text-slate-400 block">數量</label>
                        <input type="number" v-model.number="item.qty"
                            class="w-full p-1 font-mono text-center border rounded border-slate-200" />
                    </div>
                    <div class="col-span-2">
                        <label class="text-[10px] text-slate-400 block">單位</label>
                        <input type="text" v-model="item.unit" placeholder="個"
                            class="w-full p-1 text-center border rounded border-slate-200" />
                    </div>
                    <div class="col-span-3">
                        <label class="text-[10px] text-slate-400 block">單價</label>
                        <input type="number" v-model.number="item.price"
                            class="w-full p-1 font-mono text-right border rounded border-slate-200" />
                    </div>
                    <div class="col-span-4 text-right">
                        <label class="text-[10px] text-slate-400 block">金額</label>
                        <div class="font-bold text-emerald-600 pt-1 font-mono">{{ formatNumber(item.qty * item.price) }}
                        </div>
                    </div>
                    <div class="col-span-1 flex items-end justify-center">
                        <button @click="removeItem(index)" class="text-red-400 hover:text-red-600 pb-1"><i
                                class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white border-2 border-slate-800 text-slate p-4 rounded-xl shadow-lg">
            <div class="flex justify-between items-end mb-2">
                <span class="text-sm text-slate-400">總計金額 (新台幣)</span>
                <span class="text-2xl font-bold font-mono">NT$ {{ formatNumber(editingTotal) }}</span>
            </div>
            <div class="text-right text-sm text-emerald-400 border-t border-slate-600 pt-2">
                {{ numberToChineseFinancial(editingTotal) }} 正
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
            <button @click="handleManualSave"
                class="bg-emerald-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all">
                <i class="fa-solid fa-save mr-1"></i> 儲存
            </button>
            <button @click="exportToImage"
                class="bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all">
                <i class="fa-solid fa-share-nodes mr-1"></i>分享 / 下載
            </button>
            <button @click="archiveQuotation"
                class="bg-slate-200 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-300 active:scale-95 transition-all col-span-2">
                <i class="fa-solid fa-box-archive mr-1"></i> 封存此單
            </button>
        </div>

        <div id="capture-area">
            <div class="border-4 border-slate-800 p-4 relative min-h-[1108px]">
                <div class="text-center">
                    <h1
                        class="inline-block pb-4 text-4xl font-bold text-slate-900 tracking-widest border-b-4 border-double border-slate-900">
                        估 價 單</h1>
                    <div class="text-2xl text-slate-500 tracking-wide uppercase">Estimate</div>
                </div>
                <div class="text-slate-800 text-lg mt-4">
                    <div class="ps-3 w-1/2 border-b border-slate-300 py-3 flex justify-between items-center">
                        <span class="font-bold text-2xl mr-2">{{ localData.customerCompany }}</span>
                        <span>台照</span>
                    </div>
                    <div class="text-lg mb-2 grid grid-cols-2 gap-4">
                        <div class="ps-3 border-b border-slate-300 py-3 flex items-center">{{
                            formatDateToROC(localData.date) }}</div>
                        <div v-if="localData.customerName"
                            class="ps-3 border-b border-slate-300 py-3 flex items-center">
                            <span class="font-bold mr-2">To. </span> {{ localData.customerName }}
                        </div>
                    </div>
                </div>
                <table class="w-full mb-8 text-left border-collapse mt-4">
                    <thead>
                        <tr class="bg-slate-800 text-white">
                            <th class="pb-4 w-12 text-center"></th>
                            <th class="pb-4">品名</th>
                            <th class="pb-4 w-24">規格</th>
                            <th class="pb-4 w-16 text-center">數量</th>
                            <th class="pb-4 w-12 text-center">單位</th>
                            <th class="pb-4 pe-2 w-24 text-right">單價</th>
                            <th class="pb-4 pe-2 w-28 text-right">金額</th>
                            <th class="pb-4 ps-2 w-24">備註</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-700">
                        <tr v-for="(item, index) in localData.items" :key="index" class="border-b border-slate-200">
                            <td class="pb-4 border-e text-center">{{ index + 1 }}</td>
                            <td class="pb-4 ps-3 border-e font-medium">{{ item.name }}</td>
                            <td class="pb-4 ps-3 border-e text-sm text-slate-500">{{ item.spec }}</td>
                            <td class="pb-4 border-e text-center">{{ item.qty }}</td>
                            <td class="pb-4 border-e text-center">{{ item.unit }}</td>
                            <td class="pb-4 pe-3 border-e text-right">{{ formatNumber(item.price) }}</td>
                            <td class="pb-4 pe-3 border-e text-right font-bold">{{ formatNumber(item.qty * item.price)
                                }}</td>
                            <td class="pb-4 text-xs text-slate-400">{{ item.remark }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="bg-blue-50 border-t-2 border-blue-800">
                            <td colspan="6" class="ps-3 pb-4 font-bold border-r-2 border-blue-800">總計新台幣 {{
                                numberToChineseFinancial(editingTotal) }} 正</td>
                            <td colspan="2" class="pb-4 text-right font-black text-xl text-slate-900">NT$ {{
                                formatNumber(editingTotal) }}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                <div class="flex justify-end items-end mt-8 relative">
                    <div class="text-center w-40 relative">
                        <div class="border-b border-slate-800 pt-12 pb-16 mb-2 font-bold text-slate-800">僅供估價單使用</div>
                        <img v-if="selectedStampImage" :src="selectedStampImage"
                            class="absolute -top-2 left-1/2 transform -translate-x-1/2 object-contain opacity-80 mix-blend-multiply pointer-events-none max-h-32" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import html2canvas from 'html2canvas';
import { formatNumber, formatDateToROC, numberToChineseFinancial } from '../utils/helpers';
import AutoSaveNotify from '../components/AutoSaveNotify.vue';
import ImagePreviewModal from '../components/ImagePreviewModal.vue';

defineOptions({
    name: 'EditView'
})

const props = defineProps(['initialData', 'stamps']);

const emit = defineEmits(['save', 'archive', 'back']);

// 初始化資料深拷貝，避免直接改動 prop
const localData = ref(JSON.parse(JSON.stringify(props.initialData)));
// 控制預覽視窗的狀態
const showPreviewModal = ref(false);
const previewImageUrl = ref('');

// 計算總額
const editingTotal = computed(() => {
    return localData.value.items.reduce((sum, item) => sum + item.qty * item.price, 0);
});

// 計算選中的印章圖片
const selectedStampImage = computed(() => {
    const s = props.stamps.find(s => s.id === localData.value.stampId);
    return s ? s.image : null;
});

const previewFileName = computed(() => {
    const company = localData.value.customerCompany || '未命名';
    const date = localData.value.date;
    return `估價單-${company}-${date}.png`;
});

const previewCustomerCompany = computed(() => {
    return localData.value.customerCompany || '未命名';
});

// CRUD 操作
const addItem = () => {
    localData.value.items.push({ name: "", spec: "", qty: 1, unit: "箱", price: 0, remark: "" });
};
const removeItem = (index) => {
    localData.value.items.splice(index, 1);
};

// 儲存邏輯
const save = (silent = false) => {
    localData.value.totalAmount = editingTotal.value;
    // Emit event update parent
    emit('save', JSON.parse(JSON.stringify(localData.value)));
    if (!silent) {
        // 只有手動儲存才跳出 alert，自動儲存不跳
        // 這裡我們由父層處理返回，或者這裡不處理
    }
};

const handleManualSave = () => {
    save(false);
    alert("儲存成功！");
    emit('back');
};

const archiveQuotation = () => {
    if (!confirm("確定要封存此估價單嗎？")) return;
    localData.value.isArchived = true;
    localData.value.totalAmount = editingTotal.value;
    emit('archive', JSON.parse(JSON.stringify(localData.value)));
};

// --- 自動儲存邏輯 ---
const showAutoSaveNotify = ref(false);
let autoSaveTimer = null;

watch(localData, (newVal) => {
    if (!newVal.id) return;

    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {
        save(true); // 執行靜默儲存
        showAutoSaveNotify.value = true;
        setTimeout(() => { showAutoSaveNotify.value = false; }, 2000);
    }, 1000);
}, { deep: true });

// --- 截圖功能 ---
const exportToImage = () => {
    // 1. 先儲存資料
    save(true);

    // 2. 清空舊的預覽圖，並打開彈窗顯示載入中
    previewImageUrl.value = '';
    showPreviewModal.value = true;

    // 3. 等待 DOM 更新後開始截圖
    setTimeout(() => {
        const element = document.getElementById("capture-area");
        if (!element) return;

        // 4. 使用 html2canvas
        html2canvas(element, { scale: 3, useCORS: true })
            .then((canvas) => {
                // 5. 截圖成功，獲取圖片的 Data URL
                const dataUrl = canvas.toDataURL("image/png");
                // 6. 將 URL 設定給狀態，這會更新預覽視窗中的圖片
                previewImageUrl.value = dataUrl;
            }).catch(err => {
                console.error("截圖失敗:", err);
                alert("產生圖片失敗，請稍後再試。(如果持續失敗，可能是色彩格式相容性問題)");
                showPreviewModal.value = false; // 關閉視窗
            });
    }, 100);
};
</script>

<style scoped>
#capture-area {
    background: white;
    width: 800px;
    position: absolute;
    left: -9999px;
    top: 0;
    padding: 20px;
}
</style>