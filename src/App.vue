<template>
  <header class="bg-white p-4 shadow-sm z-10 flex justify-between items-center h-16 shrink-0">
    <h1 class="text-lg font-bold text-slate-800 flex items-center gap-2">
      <i class="fa-solid fa-file-invoice-dollar text-emerald-500"></i>
      {{ pageTitle }}
    </h1>
    <div>
      <span class="text-slate-300 text-xs mr-2">v{{ version }}</span>
      <button v-if="currentView === 'edit'" @click="goHome" class="text-slate-400 hover:text-slate-600">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>
    </div>
  </header>

  <main class="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
    <div v-if="currentView === 'home'" class="space-y-4">
      <div class="relative">
        <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400"></i>
        <input type="text" v-model="searchText" placeholder="搜尋公司或客戶..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
      </div>

      <div v-if="activeQuotations.length === 0" class="text-center py-10 text-slate-400">
        <i class="fa-regular fa-folder-open text-4xl mb-3"></i>
        <p>尚無估價單，請點擊下方按鈕新增</p>
      </div>

      <div v-for="q in activeQuotations" :key="q.id" @click="editQuotation(q.id)"
        class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 hover:shadow-md transition-shadow cursor-pointer active:scale-95 duration-100">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-slate-800 text-lg">
            {{ q.customerCompany || '未命名公司' }}
          </h3>
          <span class="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{{ q.date }}</span>
        </div>
        <div class="flex justify-between items-center text-sm text-slate-500">
          <span><i class="fa-solid fa-user mr-1"></i> {{
            q.customerName || '未填寫' }}</span>
          <span class="font-bold text-emerald-600 text-base">NT$ {{ formatNumber(q.totalAmount) }}</span>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'edit'" class="space-y-4">
      <div class="bg-white p-4 rounded-xl shadow-sm space-y-3">
        <div class="font-bold text-slate-800 mb-3">估價單明細</div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">客戶公司名稱</label>
          <input type="text" v-model="editingData.customerCompany"
            class="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none transition-colors"
            placeholder="輸入公司名稱" />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-500 mb-1">日期</label>
            <input type="date" v-model="editingData.date"
              class="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">客戶名稱 (To:)</label>
            <input type="text" v-model="editingData.customerName"
              class="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">選擇印章圖檔</label>
          <select v-model="editingData.stampId"
            class="w-full p-2 border border-slate-200 rounded bg-white focus:border-emerald-500 outline-none">
            <option value="">不使用印章</option>
            <option v-for="stamp in stamps" :value="stamp.id">
              {{ stamp.name }}
            </option>
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

        <div v-for="(item, index) in editingData.items" :key="item.id"
          class="mb-4 pb-4 border-b border-dashed border-slate-200 last:border-0 last:pb-0 relative animate-fade-in">
          <div class="grid grid-cols-12 gap-2 relative z-10">
            <div class="text-slate-200 font-black text-4xl select-none opacity-50">
              {{ index + 1 }}
            </div>
            <div class="col-span-10">
              <input type="text" v-model="item.name" placeholder="品名"
                class="w-full p-2 bg-slate-50 border-0 rounded text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 placeholder-slate-300" />
            </div>
            <div class="col-span-6">
              <input type="text" v-model="item.spec" placeholder="規格"
                class="w-full p-1 text-sm border-b border-slate-200 focus:border-emerald-500 outline-none" />
            </div>
            <div class="col-span-6">
              <input type="text" v-model="item.remark" placeholder="備註"
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
              <div class="font-bold text-emerald-600 pt-1 font-mono">
                {{ formatNumber(item.qty * item.price)
                }}
              </div>
            </div>
            <div class="col-span-1 flex items-end justify-center">
              <button @click="removeItem(index)" class="text-red-400 hover:text-red-600 pb-1">
                <i class="fa-solid fa-trash"></i>
              </button>
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
        <button @click="saveQuotation"
          class="bg-emerald-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all">
          <i class="fa-solid fa-save mr-1"></i> 儲存
        </button>
        <button @click="exportToImage"
          class="bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all">
          <i class="fa-solid fa-image mr-1"></i> 轉成圖檔
        </button>
        <button @click="archiveQuotation"
          class="bg-slate-200 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-300 active:scale-95 transition-all col-span-2">
          <i class="fa-solid fa-box-archive mr-1"></i>
          封存此單
        </button>
      </div>
    </div>

    <div v-if="currentView === 'archive'" class="space-y-4">
      <div v-if="archivedQuotations.length === 0" class="text-center py-10 text-slate-400">
        <i class="fa-solid fa-box-open text-4xl mb-3"></i>
        <p>沒有封存的項目</p>
      </div>
      <div v-for="q in archivedQuotations" :key="q.id"
        class="bg-slate-100 p-4 rounded-xl border border-slate-200 opacity-75 grayscale hover:grayscale-0 transition-all">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-slate-700">
            {{ q.customerCompany }}
          </h3>
          <span class="text-xs">{{ q.date }}</span>
        </div>
        <div class="flex justify-between items-center mt-3">
          <span class="font-mono font-bold">NT$ {{ formatNumber(q.totalAmount) }}</span>
          <button @click="restoreQuotation(q.id)"
            class="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold">
            <i class="fa-solid fa-rotate-left"></i> 復原
          </button>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'stamps'" class="space-y-4">
      <div class="bg-white p-4 rounded-xl shadow-sm">
        <h3 class="font-bold text-slate-700 mb-3">新增印章</h3>
        <div class="space-y-3">
          <input type="text" v-model="newStampName" placeholder="印章名稱 (如：公司大小章)" class="w-full p-2 border rounded" />
          <div
            class="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
            <input type="file" @change="handleImageUpload" accept="image/*"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div v-if="!newStampImage">
              <i class="fa-solid fa-cloud-upload-alt text-2xl text-slate-400 mb-1"></i>
              <p class="text-xs text-slate-500">
                點擊上傳圖片
              </p>
            </div>
            <img v-else :src="newStampImage" class="max-h-20 mx-auto object-contain" />
          </div>
          <button @click="addStamp" :disabled="!newStampName || !newStampImage"
            class="w-full bg-slate-800 text-white py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            新增印章
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="(stamp, index) in stamps" :key="stamp.id"
          class="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="stamp.image" class="w-12 h-12 object-contain bg-slate-50 rounded border border-slate-100" />
            <span class="font-bold text-slate-700">{{ stamp.name }}</span>
          </div>
          <button @click="deleteStamp(index)" class="text-red-400 hover:text-red-600 p-2">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-if="currentView === 'settings'" class="p-4 space-y-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <h3 class="font-bold text-slate-700 mb-4 text-lg">資料備份與還原</h3>

        <div class="space-y-4">
          <div class="border border-slate-200 rounded-lg p-4">
            <h4 class="font-medium text-slate-600 mb-2">
              <i class="fa-solid fa-download mr-2 text-emerald-500"></i>
              全部資料匯出
            </h4>
            <p class="text-sm text-slate-500 mb-3">
              將所有估價單、封存記錄和印章匯出為 JSON 檔案，方便備份或轉移至其他裝置。
            </p>
            <button @click="exportAllData"
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold transition-colors">
              <i class="fa-solid fa-file-export mr-2"></i>
              匯出全部資料
            </button>
          </div>

          <div class="border border-slate-200 rounded-lg p-4">
            <h4 class="font-medium text-slate-600 mb-2">
              <i class="fa-solid fa-upload mr-2 text-blue-500"></i>
              全部資料匯入
            </h4>
            <p class="text-sm text-slate-500 mb-3">
              從先前匯出的 JSON 檔案還原資料。注意：這將覆蓋目前所有資料。
            </p>
            <label
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center cursor-pointer">
              <i class="fa-solid fa-file-import mr-2"></i>
              選擇檔案匯入
              <input type="file" accept=".json" @change="importAllData" class="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-amber-500 mt-1"></i>
          <div>
            <h4 class="font-medium text-amber-700">注意事項</h4>
            <p class="text-sm text-amber-600 mt-1">
              匯入資料會完全取代現有資料，建議先匯出備份再進行匯入操作。
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <button v-if="currentView === 'home'" @click="createNewQuotation"
    class="absolute bottom-20 right-4 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-transform active:scale-90 z-20">
    <i class="fa-solid fa-plus"></i>
  </button>

  <nav v-if="currentView !== 'edit'"
    class="bg-white border-t border-slate-200 h-16 shrink-0 flex justify-around items-center text-xs font-medium z-10 pb-safe">
    <button @click="currentView = 'home'"
      :class="currentView === 'home' || currentView === 'edit' ? 'text-emerald-600' : 'text-slate-400'"
      class="flex flex-col items-center w-full h-full justify-center">
      <i class="fa-solid fa-list-ul text-lg mb-1"></i>
      清單
    </button>
    <button @click="currentView = 'archive'" :class="currentView === 'archive' ? 'text-emerald-600' : 'text-slate-400'"
      class="flex flex-col items-center w-full h-full justify-center">
      <i class="fa-solid fa-box-archive text-lg mb-1"></i>
      封存
    </button>
    <button @click="currentView = 'stamps'" :class="currentView === 'stamps' ? 'text-emerald-600' : 'text-slate-400'"
      class="flex flex-col items-center w-full h-full justify-center">
      <i class="fa-solid fa-stamp text-lg mb-1"></i>
      印章
    </button>
    <button @click="currentView = 'settings'"
      :class="currentView === 'settings' ? 'text-emerald-600' : 'text-slate-400'"
      class="flex flex-col items-center w-full h-full justify-center">
      <i class="fa-solid fa-gear text-lg mb-1"></i>
      設定
    </button>
  </nav>

  <!-- 估價單預覽區域 (轉圖時使用，隱藏在畫面外) -->
  <div id="capture-area">
    <div class="border-4 border-slate-800 p-4 relative min-h-[1108px]">
      <div class="text-center">
        <h1
          class="inline-block pb-4 text-4xl font-bold text-slate-900 tracking-widest border-b-4 border-double border-slate-900">
          估 價 單
        </h1>
        <div class="text-2xl text-slate-500 tracking-wide uppercase">
          Estimate
        </div>
      </div>

      <div class="text-slate-800 text-lg">
        <div class="ps-3 w-1/2 border-b border-slate-300 py-3 flex justify-between items-center">
          <span class="font-bold text-2xl mr-2">
            {{ editingData.customerCompany }}
          </span>
          <span>台照</span>
        </div>
        <div class="text-lg mb-2 grid grid-cols-2 gap-4">
          <div class="ps-3 border-b border-slate-300 py-3 flex items-center">
            {{ formatDateToROC(editingData.date) }}
          </div>

          <div v-if="editingData.customerName" class="ps-3 border-b border-slate-300 py-3 flex items-center">
            <span class="font-bold mr-2">To. </span> {{ editingData.customerName }}
          </div>
        </div>
      </div>

      <table class="w-full mb-8 text-left border-collapse">
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
          <tr v-for="(item, index) in editingData.items" :key="index" class="border-b border-slate-200">
            <td class="pb-4 border-e text-center">
              {{ index + 1 }}
            </td>
            <td class="pb-4 ps-3 border-e font-medium">
              {{ item.name }}
            </td>
            <td class="pb-4 ps-3 border-e text-sm text-slate-500">
              {{ item.spec }}
            </td>
            <td class="pb-4 border-e text-center">
              {{ item.qty }}
            </td>
            <td class="pb-4 border-e text-center">
              {{ item.unit }}
            </td>
            <td class="pb-4 pe-3 border-e text-right">
              {{ formatNumber(item.price) }}
            </td>
            <td class="pb-4 pe-3 border-e text-right font-bold">
              {{ formatNumber(item.qty * item.price) }}
            </td>
            <td class="pb-4 text-xs text-slate-400">
              {{ item.remark }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-blue-50 border-t-2 border-blue-800">
            <td colspan="6" class="ps-3 pb-4 font-bold border-r-2 border-blue-800">
              總計新台幣 {{ numberToChineseFinancial(editingTotal) }} 正
            </td>
            <td colspan="2" class="pb-4 text-right font-black text-xl text-slate-900">
              NT$ {{ formatNumber(editingTotal) }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div class="flex justify-end items-end mt-8 relative">
        <div class="text-center w-40 relative">
          <div class="border-b border-slate-800 pt-14 pb-16 mb-2 font-bold text-slate-800">
            僅供估價單使用
          </div>
          <img v-if="selectedStampImage" :src="selectedStampImage"
            class="absolute -top-2 left-1/2 transform -translate-x-1/2 object-contain opacity-80 mix-blend-multiply pointer-events-none" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import pkg from '../package.json'

const version = pkg.version
// --- State ---
const currentView = ref("home"); // home, edit, archive, stamps
const quotations = ref([]);
const stamps = ref([]);
const searchText = ref("");
// Editing State
const editingData = ref({
  id: null,
  customerCompany: "",
  date: new Date().toISOString().split("T")[0],
  customerName: "",
  stampId: "",
  items: [],
  isArchived: false,
});
// Stamp Management
const newStampName = ref("");
const newStampImage = ref(null);

// --- Computed ---
const pageTitle = computed(() => {
  const map = {
    home: "所有估價單",
    edit: "編輯估價單",
    archive: "封存箱",
    stamps: "印章管理",
    settings: "設定",
  };
  return map[currentView.value];
});
const activeQuotations = computed(() => {
  let list = quotations.value.filter(
    (q) => !q.isArchived,
  );
  if (searchText.value) {
    const low = searchText.value.toLowerCase();
    list = list.filter(
      (q) =>
        (q.customerCompany || "")
          .toLowerCase()
          .includes(low) ||
        (q.customerName || "")
          .toLowerCase()
          .includes(low),
    );
  }
  return list.sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
});
const archivedQuotations = computed(() => {
  return quotations.value.filter((q) => q.isArchived);
});
const editingTotal = computed(() => {
  return editingData.value.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );
});
const selectedStampImage = computed(() => {
  const s = stamps.value.find(
    (s) => s.id === editingData.value.stampId,
  );
  return s ? s.image : null;
});
// --- Methods: navigation & CRUD ---
function goHome() { currentView.value = "home" };
function createNewQuotation() {
  editingData.value = {
    id: Date.now(),
    customerCompany: "",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    stampId:
      stamps.value.length > 0
        ? stamps.value[0].id
        : "",
    items: [
      {
        name: "",
        spec: "",
        qty: 1,
        unit: "箱",
        price: 0,
        remark: "",
      },
    ],
    isArchived: false,
    totalAmount: 0, // cached for list view
  };
  currentView.value = "edit";
};
function editQuotation(id) {
  const target = quotations.value.find(
    (q) => q.id === id,
  );
  if (target) {
    // Deep copy to prevent direct mutation before save
    editingData.value = JSON.parse(
      JSON.stringify(target),
    );
    currentView.value = "edit";
  }
};
function addItem() {
  editingData.value.items.push({
    name: "",
    spec: "",
    qty: 1,
    unit: "箱",
    price: 0,
    remark: "",
  });
};
function removeItem(index) {
  editingData.value.items.splice(index, 1);
};
function save() {
  // Calculate total before saving
  editingData.value.totalAmount = editingTotal.value;
  const index = quotations.value.findIndex(
    (q) => q.id === editingData.value.id,
  );
  if (index > -1) {
    quotations.value[index] = JSON.parse(
      JSON.stringify(editingData.value),
    );
  } else {
    quotations.value.push(
      JSON.parse(JSON.stringify(editingData.value)),
    );
  }
  saveToLocalStorage();
};
function saveQuotation() {
  save();
  alert("儲存成功！");
  goHome();
};
function archiveQuotation() {
  if (
    !confirm(
      "確定要封存此估價單嗎？它將不會顯示在首頁。",
    )
  )
    return;
  editingData.value.isArchived = true;
  // Ensure we save the archived state
  const index = quotations.value.findIndex(
    (q) => q.id === editingData.value.id,
  );
  if (index > -1) {
    quotations.value[index].isArchived = true;
  } else {
    editingData.value.totalAmount = editingTotal.value;
    quotations.value.push(
      JSON.parse(JSON.stringify(editingData.value)),
    );
  }
  saveToLocalStorage();
  goHome();
};
function restoreQuotation(id) {
  const q = quotations.value.find((q) => q.id === id);
  if (q) {
    q.isArchived = false;
    saveToLocalStorage();
  }
};
function saveToLocalStorage() {
  localStorage.setItem(
    "quotations",
    JSON.stringify(quotations.value),
  );
  localStorage.setItem(
    "stamps",
    JSON.stringify(stamps.value),
  );
};
// --- Methods: Stamp Management ---
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    newStampImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};
function addStamp() {
  stamps.value.push({
    id: Date.now(),
    name: newStampName.value,
    image: newStampImage.value,
  });
  saveToLocalStorage();
  newStampName.value = "";
  newStampImage.value = null;
};
function deleteStamp(index) {
  if (confirm("確定刪除此印章？")) {
    stamps.value.splice(index, 1);
    saveToLocalStorage();
  }
};
// --- Methods: Export ---
function getDPR() {
  return window.devicePixelRatio && window.devicePixelRatio > 1
    ? window.devicePixelRatio
    : 1;
}
function exportToImage() {
  save();
  // Update DOM before capture
  setTimeout(() => {
    const element =
      document.getElementById("capture-area");
    html2canvas(element, {
      scale: 5, // High resolution
      useCORS: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `估價單-${editingData.value.customerCompany}-${editingData.value.date}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  }, 100);
};
// --- Methods: Data Export/Import ---
function exportAllData() {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    quotations: quotations.value,
    stamps: stamps.value
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `估價單備份_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  alert('資料匯出成功！');
}
function importAllData() {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.quotations || !data.stamps) {
        alert('檔案格式錯誤，請選擇正確的備份檔案。');
        return;
      }

      if (!confirm('確定要匯入資料嗎？這將覆蓋目前所有的估價單和印章資料。')) {
        return;
      }

      quotations.value = data.quotations;
      stamps.value = data.stamps;
      saveToLocalStorage();

      alert('資料匯入成功！');
      currentView.value = 'home';
    } catch (error) {
      console.error('匯入失敗:', error);
      alert('檔案解析失敗，請確認檔案格式正確。');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
// --- Utilities ---
function formatNumber(num) {
  return (num || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function formatDateToROC(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]) - 1911;
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  return `${year}年${month}月${day}日`;
};

// Override with Robust Financial Chinese Function
function numberToChineseFinancial(n) {
  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
    return "數據非法";
  let unit = "仟佰拾億仟佰拾萬仟佰拾元角分";
  let str = "";
  n += "00";
  let p = n.indexOf(".");
  if (p >= 0) n = n.substring(0, p) + n.substr(p + 1, 2);
  unit = unit.substr(unit.length - n.length);
  for (let i = 0; i < n.length; i++)
    str +=
      "零壹貳參肆伍陸柒捌玖".charAt(n.charAt(i)) +
      unit.charAt(i);
  return str
    .replace(/零(仟|佰|拾|角)/g, "零")
    .replace(/(零)+/g, "零")
    .replace(/零(萬|億|元)/g, "$1")
    .replace(/(億)萬|壹(拾)/g, "$1$2")
    .replace(/^元零?|零分/g, "")
    .replace(/元$/g, "元");
};

// --- Initial Load ---
onMounted(() => {
  const savedQuotations =
    localStorage.getItem("quotations");
  if (savedQuotations)
    quotations.value = JSON.parse(savedQuotations);
  const savedStamps = localStorage.getItem("stamps");
  if (savedStamps) stamps.value = JSON.parse(savedStamps);
});
</script>

<style scoped>
/* 隱藏滾動條但保持功能 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 估價單預覽專用樣式 (轉圖時使用) */
#capture-area {
  background: white;
  width: 800px;
  /* 固定寬度以保證圖片清晰 */
  position: absolute;
  left: -9999px;
  top: 0;
  padding: 20px;
}
</style>
