# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概觀

行動優先的單頁 Vue 3 估價單產生器，無後端。同一份程式碼有兩種部署形態：

1. **Web/PWA**：部署於 GitHub Pages，資料存瀏覽器 LocalStorage。
2. **Android App**（Capacitor 包裝）：資料存 App 自身沙盒空間（`@capacitor/preferences`），
   與 Chrome 完全脫鉤，不受「解除安裝更新」「清除瀏覽器資料」影響。
   遷移緣由與完整設計見 [CAPACITOR_MIGRATION_1.md](CAPACITOR_MIGRATION_1.md)。

兩種環境透過 `Capacitor.isNativePlatform()` 判斷，在儲存、分享、匯出/匯入、Service Worker 註冊等處分流。

## 常用指令

```bash
npm run dev           # 啟動開發伺服器 (Vite)
npm run build         # 產生 dist/ 生產版（GitHub Pages，base=/quotation-editor/）
npm run preview       # 預覽 build 結果
npm run deploy        # bump patch 版號 → build → 推到 gh-pages 分支
npm run bump-version  # 僅遞增 package.json 的 patch 版本
npm run build:android # 以相對路徑建置 (CAP_BUILD=1) 並 cap sync 進 android/ 專案
npx cap open android  # 用 Android Studio 開啟原生專案
```

無 lint 與測試流程。

## 架構

### 狀態與檢視切換
- 沒有使用 vue-router。[src/App.vue](src/App.vue) 以 `currentView` ref 字串 (`home` / `edit` / `archive` / `stamps` / `settings`) 配合 `v-if` 切換五個 view 元件。
- **所有持久化狀態 (`quotations`、`stamps`) 都存活在 App.vue 中**。子元件透過 props 接收資料、emit 事件回拋 (`save` / `archive` / `restore` / `add` / `delete` / `export` / `import`)，由 App.vue 統一寫入儲存層 (`saveToLocalStorage()`，內部呼叫 `storageSet`)。新增 view 或資料時請維持此單向流模式。
- 儲存 key 僅有 `quotations` 與 `stamps`。匯出/匯入 JSON 結構為 `{ version, exportDate, quotations, stamps }`。

### 儲存抽象層（Web LocalStorage vs. 原生 Preferences）
- [src/services/storage.js](src/services/storage.js) 提供 `storageGet` / `storageSet` / `storageRemove`（皆為 async）。Web 環境走 `localStorage`（同步包成 Promise），原生環境走 `@capacitor/preferences`（App 自身沙盒儲存）。**任何新增的持久化資料一律透過這層讀寫，不要直接呼叫 `localStorage`**。
- App.vue 的 `onMounted` 是 `async`，載入資料完成前顯示 `isLoading` 轉圈畫面（見 App.vue 頂部 `v-if="isLoading"`），避免同步/非同步落差造成的 undefined 存取。所有寫入函式（`saveQuotationData`、`archiveQuotationData` 等）也都是 `async`，內部 `await saveToLocalStorage()`。
- App.vue 的 `onMounted` 同時處理：原生環境下若資料為空且尚未顯示過遷移導引（Preferences key `migrationGuideShown`），彈出一次性提示（因為原生儲存與網頁版 Chrome localStorage 互不相通，僅能靠 JSON 匯出/匯入搬資料）；以及 Android 實體/手勢返回鍵（`@capacitor/app` 的 `backButton` 事件，非首頁先回首頁、首頁再按離開 App）。

### 編輯與自動儲存
- [src/views/EditView.vue](src/views/EditView.vue) 透過深拷貝 `props.initialData` 為 `localData`，避免直接改動父層資料。
- 自動儲存：`watch(localData, ..., { deep: true })` + 1 秒 debounce → emit `save` (silent)。手動儲存按鈕另外觸發 alert 並 emit `back`。新增需要自動儲存的欄位時，確認其位於 `localData` 樹內。

### 截圖匯出
- EditView 內有一個離屏的 `#capture-area` div (`position: absolute; left: -9999px; width: 800px`)，這是 `html2canvas` 截圖的來源。修改估價單版型請改這個區塊，並注意它與螢幕上的編輯表單是兩套各自的 DOM。
- `html2canvas` 以 `scale: 3, useCORS: true` 截圖，輸出 dataURL 後丟給 [ImagePreviewModal](src/components/ImagePreviewModal.vue)。
- ImagePreviewModal 依 `Capacitor.isNativePlatform()` 分流：Web 走 Web Share API (`navigator.canShare({ files })`) 或 `<a download>`；原生環境改用 `@capacitor/filesystem` 寫入暫存檔（分享完即刪除）+ `@capacitor/share` 呼叫系統分享面板，因為 Android WebView 不支援 `navigator.share` 也不會觸發 `<a download>`。
- 印章圖片預期以 Base64 / 本地上傳形式存於 `stamps[i].image`，避免 CORS 導致截圖空白（原生環境下這類 Base64 圖片會直接進 Preferences，資料量過大時需評估改用 SQLite，見 CAPACITOR_MIGRATION_1.md 第 9 節）。

### Tailwind 載入方式
- Tailwind 透過 [index.html](index.html) 的 `<script src="https://cdn.tailwindcss.com">` CDN 載入，**並未** 設定 PostCSS / `tailwind.config.js`。html2canvas 也同時走 CDN 與 npm 兩種方式 (EditView 用 npm import)。新增 Tailwind plugin / 自訂 theme 需先把建置流程改為本地 Tailwind。

### 建置與部署
- [vite.config.js](vite.config.js) 的 `base`：`CAP_BUILD=1`（Android 建置）時為 `./`（相對路徑）；否則 production 時為 `/quotation-editor/`，dev 為 `/`。若改 GitHub repo 名請同步調整 GH Pages 那一支。
- 啟用 `vite-plugin-pwa` (`registerType: 'autoUpdate'`，`manifest: false`，`injectRegister: false`)，會產生 `dist/sw.js`，但**不會**自動注入註冊腳本——改由 [src/main.js](src/main.js) 手動 `import('virtual:pwa-register')` 並以 `Capacitor.isNativePlatform()` 判斷是否呼叫 `registerSW()`。原生 App 不應該有 Service Worker（有自己的更新機制），新增邏輯時勿破壞這個判斷。`public/manifest.webmanifest.json` 為手動維護的 PWA manifest。
- Path alias `@` → `./src` (見 [vite.config.js](vite.config.js) 與 [jsconfig.json](jsconfig.json))。
- `npm run deploy` 會直接遞增 patch 版本並 commit-less 寫入 `package.json`，再用 `gh-pages` 推 `dist/`。執行前確認 working tree 乾淨。
- `npm run build:android` → `npx cap sync android`，將 `dist/` 複製進 `android/app/src/main/assets/public`。`android/` 目錄是 `npx cap add android` 產生的原生專案骨架，簽章 keystore 相關細節見 [README.md](README.md) 的「Android App (Capacitor)」章節，**不要**把 keystore 或密碼提交進 git。

### 在地化工具
[src/utils/helpers.js](src/utils/helpers.js) 提供台灣特定格式：`formatDateToROC` (轉民國年)、`numberToChineseFinancial` (中文財務數字「壹貳參…元」)、`formatNumber` (千分位)。表單顯示金額/日期請優先沿用，避免重新實作。

### 注意事項
- `src/App_bak.vue` 是早期單檔架構的備份，**不要修改、不要被它誤導**。目前真正進入 build 的是 `src/App.vue` + 拆分後的 views/components。
- `package.json` 版本號會被 `scripts/bump-version.js` 自動修改，且會被 App.vue 顯示在 Header 上 (`pkg.version`)。手動改 commit 時注意衝突。
