<template>
  <div class="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">

    <Header :title="pageTitle" :version="version" :show-close="currentView === 'edit'" @close="currentView = 'home'" />

    <main class="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">

      <HomeView v-if="currentView === 'home'" :quotations="quotations" @create="createNewQuotation"
        @edit="editQuotation" />

      <EditView v-if="currentView === 'edit'" :initial-data="editingData" :stamps="stamps" @save="saveQuotationData"
        @archive="archiveQuotationData" @back="currentView = 'home'" />

      <ArchiveView v-if="currentView === 'archive'" :quotations="quotations" @restore="restoreQuotation" />

      <StampsView v-if="currentView === 'stamps'" :stamps="stamps" @add="addStamp" @delete="deleteStamp" />

      <SettingsView v-if="currentView === 'settings'" @export="exportAllData" @import="importAllData" />

    </main>

    <NavBar v-if="currentView !== 'edit'" :current="currentView" @change="(view) => currentView = view" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import pkg from '../package.json'; // 記得確認 package.json 路徑

// Components
import Header from './components/Header.vue';
import NavBar from './components/NavBar.vue';
import HomeView from './views/HomeView.vue';
import EditView from './views/EditView.vue';
import ArchiveView from './views/ArchiveView.vue';
import StampsView from './views/StampsView.vue';
import SettingsView from './views/SettingsView.vue';

const version = pkg.version;
const currentView = ref("home");
const quotations = ref([]);
const stamps = ref([]);
const editingData = ref(null); // 傳遞給 EditView 的資料

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

// --- Data Persistence ---
function saveToLocalStorage() {
  localStorage.setItem("quotations", JSON.stringify(quotations.value));
  localStorage.setItem("stamps", JSON.stringify(stamps.value));
}

onMounted(() => {
  const savedQ = localStorage.getItem("quotations");
  if (savedQ) quotations.value = JSON.parse(savedQ);
  const savedS = localStorage.getItem("stamps");
  if (savedS) stamps.value = JSON.parse(savedS);
});

// --- Action Handlers ---

// Create / Edit
function createNewQuotation() {
  editingData.value = {
    id: Date.now(),
    customerCompany: "",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    stampId: stamps.value.length > 0 ? stamps.value[0].id : "",
    items: [{ name: "", spec: "", qty: 1, unit: "箱", price: 0, remark: "" }],
    isArchived: false,
    totalAmount: 0,
  };
  currentView.value = "edit";
}

function editQuotation(id) {
  const target = quotations.value.find(q => q.id === id);
  if (target) {
    editingData.value = JSON.parse(JSON.stringify(target));
    currentView.value = "edit";
  }
}

// Save from EditView (包含自動儲存觸發)
function saveQuotationData(newData) {
  const index = quotations.value.findIndex(q => q.id === newData.id);
  if (index > -1) {
    quotations.value[index] = newData;
  } else {
    quotations.value.push(newData);
  }
  saveToLocalStorage();
}

// Archive from EditView
function archiveQuotationData(newData) {
  const index = quotations.value.findIndex(q => q.id === newData.id);
  if (index > -1) {
    quotations.value[index] = newData;
  } else {
    quotations.value.push(newData);
  }
  saveToLocalStorage();
  currentView.value = "home";
}

// Restore
function restoreQuotation(id) {
  const q = quotations.value.find(q => q.id === id);
  if (q) {
    q.isArchived = false;
    saveToLocalStorage();
  }
}

// Stamps
function addStamp(stampObj) {
  stamps.value.push(stampObj);
  saveToLocalStorage();
}

function deleteStamp(index) {
  if (confirm("確定刪除此印章？")) {
    stamps.value.splice(index, 1);
    saveToLocalStorage();
  }
}

// Import / Export
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

function importAllData(data) {
  if (!data.quotations || !data.stamps) {
    alert('檔案格式錯誤');
    return;
  }
  if (!confirm('確定要匯入資料嗎？這將覆蓋目前所有資料。')) return;

  quotations.value = data.quotations;
  stamps.value = data.stamps;
  saveToLocalStorage();
  alert('資料匯入成功！');
  currentView.value = 'home';
}
</script>

<style>
/* Global Styles */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>