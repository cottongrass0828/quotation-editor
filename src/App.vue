<template>
  <div v-if="isLoading" class="flex flex-col h-screen items-center justify-center bg-slate-50 text-slate-400">
    <i class="fa-solid fa-spinner fa-spin text-3xl mb-2"></i>
    載入中...
  </div>

  <div v-else class="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">

    <div v-if="showMigrationGuide"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
        <h3 class="text-lg font-bold text-slate-800">
          <i class="fa-solid fa-circle-info text-emerald-500 mr-1"></i>
          歡迎使用 App 版
        </h3>
        <p class="text-sm text-slate-600 leading-relaxed">
          此 App 版使用獨立的儲存空間，<strong>不會自動帶入</strong>您先前在網頁版（瀏覽器 / 加到主畫面）建立的估價單資料。
        </p>
        <p class="text-sm text-slate-600 leading-relaxed">
          若您先前已有資料，請先到<strong>網頁版</strong>的「設定」頁匯出 JSON 備份，再回到本 App 的「設定」頁匯入即可。
        </p>
        <button @click="dismissMigrationGuide"
          class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold transition-colors">
          我知道了
        </button>
      </div>
    </div>

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
import { storageGet, storageSet } from './services/storage';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App as CapApp } from '@capacitor/app';

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
const isLoading = ref(true);
const showMigrationGuide = ref(false);
const MIGRATION_GUIDE_KEY = "migrationGuideShown";

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
async function saveToLocalStorage() {
  await storageSet("quotations", JSON.stringify(quotations.value));
  await storageSet("stamps", JSON.stringify(stamps.value));
}

async function dismissMigrationGuide() {
  showMigrationGuide.value = false;
  await storageSet(MIGRATION_GUIDE_KEY, "1");
}

onMounted(async () => {
  const savedQ = await storageGet("quotations");
  if (savedQ) quotations.value = JSON.parse(savedQ);
  const savedS = await storageGet("stamps");
  if (savedS) stamps.value = JSON.parse(savedS);

  if (Capacitor.isNativePlatform()) {
    // 原生環境的儲存空間與網頁版 Chrome localStorage 互不相通，
    // 首次啟動且尚無任何資料時，提示使用者改用 JSON 匯出/匯入搬移舊資料（僅顯示一次）。
    if (quotations.value.length === 0 && stamps.value.length === 0) {
      const seen = await storageGet(MIGRATION_GUIDE_KEY);
      if (!seen) showMigrationGuide.value = true;
    }

    // Android 實體/手勢返回鍵：編輯頁與子頁面先回首頁，首頁再按才離開 App
    CapApp.addListener("backButton", () => {
      if (currentView.value !== "home") {
        currentView.value = "home";
      } else {
        CapApp.exitApp();
      }
    });
  }

  isLoading.value = false;
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
    items: [{ name: "", spec: "", qty: 1, unit: "箱", price: 0, discount: 0, remark: "" }],
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
async function saveQuotationData(newData) {
  const index = quotations.value.findIndex(q => q.id === newData.id);
  if (index > -1) {
    quotations.value[index] = newData;
  } else {
    quotations.value.push(newData);
  }
  await saveToLocalStorage();
}

// Archive from EditView
async function archiveQuotationData(newData) {
  const index = quotations.value.findIndex(q => q.id === newData.id);
  if (index > -1) {
    quotations.value[index] = newData;
  } else {
    quotations.value.push(newData);
  }
  await saveToLocalStorage();
  currentView.value = "home";
}

// Restore
async function restoreQuotation(id) {
  const q = quotations.value.find(q => q.id === id);
  if (q) {
    q.isArchived = false;
    await saveToLocalStorage();
  }
}

// Stamps
async function addStamp(stampObj) {
  stamps.value.push(stampObj);
  await saveToLocalStorage();
}

async function deleteStamp(index) {
  if (confirm("確定刪除此印章？")) {
    stamps.value.splice(index, 1);
    await saveToLocalStorage();
  }
}

// Import / Export
async function exportAllData() {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    quotations: quotations.value,
    stamps: stamps.value
  };
  const json = JSON.stringify(data, null, 2);

  if (Capacitor.isNativePlatform()) {
    const fileName = 'quotation-backup.json';
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      alert(`資料已備份至「文件」資料夾：${fileName}`);
      const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Documents });
      const { value: shareable } = await Share.canShare();
      if (shareable) {
        await Share.share({ title: '估價單資料備份', url: uri });
      }
    } catch (err) {
      console.error('匯出失敗:', err);
      alert('資料匯出失敗，請稍後再試。');
    }
    return;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `估價單備份_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  alert('資料匯出成功！');
}

async function importAllData(data) {
  if (!data.quotations || !data.stamps) {
    alert('檔案格式錯誤');
    return;
  }
  if (!confirm('確定要匯入資料嗎？這將覆蓋目前所有資料。')) return;

  quotations.value = data.quotations;
  stamps.value = data.stamps;
  await saveToLocalStorage();
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
