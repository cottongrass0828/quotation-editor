# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概觀

行動優先的單頁 Vue 3 估價單產生器，所有資料保存於瀏覽器 LocalStorage，無後端。部署於 GitHub Pages。

## 常用指令

```bash
npm run dev        # 啟動開發伺服器 (Vite)
npm run build      # 產生 dist/ 生產版
npm run preview    # 預覽 build 結果
npm run deploy     # bump patch 版號 → build → 推到 gh-pages 分支
npm run bump-version  # 僅遞增 package.json 的 patch 版本
```

無 lint 與測試流程。

## 架構

### 狀態與檢視切換
- 沒有使用 vue-router。[src/App.vue](src/App.vue) 以 `currentView` ref 字串 (`home` / `edit` / `archive` / `stamps` / `settings`) 配合 `v-if` 切換五個 view 元件。
- **所有持久化狀態 (`quotations`、`stamps`) 都存活在 App.vue 中**。子元件透過 props 接收資料、emit 事件回拋 (`save` / `archive` / `restore` / `add` / `delete` / `export` / `import`)，由 App.vue 統一寫入 LocalStorage (`saveToLocalStorage()`)。新增 view 或資料時請維持此單向流模式。
- LocalStorage key 僅有 `quotations` 與 `stamps`。匯出/匯入 JSON 結構為 `{ version, exportDate, quotations, stamps }`。

### 編輯與自動儲存
- [src/views/EditView.vue](src/views/EditView.vue) 透過深拷貝 `props.initialData` 為 `localData`，避免直接改動父層資料。
- 自動儲存：`watch(localData, ..., { deep: true })` + 1 秒 debounce → emit `save` (silent)。手動儲存按鈕另外觸發 alert 並 emit `back`。新增需要自動儲存的欄位時，確認其位於 `localData` 樹內。

### 截圖匯出
- EditView 內有一個離屏的 `#capture-area` div (`position: absolute; left: -9999px; width: 800px`)，這是 `html2canvas` 截圖的來源。修改估價單版型請改這個區塊，並注意它與螢幕上的編輯表單是兩套各自的 DOM。
- `html2canvas` 以 `scale: 3, useCORS: true` 截圖，輸出 dataURL 後丟給 [ImagePreviewModal](src/components/ImagePreviewModal.vue)，由其決定走 Web Share API (`navigator.canShare({ files })`) 或下載連結。
- 印章圖片預期以 Base64 / 本地上傳形式存於 `stamps[i].image`，避免 CORS 導致截圖空白。

### Tailwind 載入方式
- Tailwind 透過 [index.html](index.html) 的 `<script src="https://cdn.tailwindcss.com">` CDN 載入，**並未** 設定 PostCSS / `tailwind.config.js`。html2canvas 也同時走 CDN 與 npm 兩種方式 (EditView 用 npm import)。新增 Tailwind plugin / 自訂 theme 需先把建置流程改為本地 Tailwind。

### 建置與部署
- [vite.config.js](vite.config.js) 的 `base` 在 production 時為 `/quotation-editor/`，dev 為 `/`。若改 GitHub repo 名請同步調整。
- 啟用 `vite-plugin-pwa` (`registerType: 'autoUpdate'`，`manifest: false`)，會自動產生 service worker。`public/manifest.webmanifest.json` 為手動維護的 PWA manifest。
- Path alias `@` → `./src` (見 [vite.config.js](vite.config.js) 與 [jsconfig.json](jsconfig.json))。
- `npm run deploy` 會直接遞增 patch 版本並 commit-less 寫入 `package.json`，再用 `gh-pages` 推 `dist/`。執行前確認 working tree 乾淨。

### 在地化工具
[src/utils/helpers.js](src/utils/helpers.js) 提供台灣特定格式：`formatDateToROC` (轉民國年)、`numberToChineseFinancial` (中文財務數字「壹貳參…元」)、`formatNumber` (千分位)。表單顯示金額/日期請優先沿用，避免重新實作。

### 注意事項
- `src/App_bak.vue` 是早期單檔架構的備份，**不要修改、不要被它誤導**。目前真正進入 build 的是 `src/App.vue` + 拆分後的 views/components。
- `package.json` 版本號會被 `scripts/bump-version.js` 自動修改，且會被 App.vue 顯示在 Header 上 (`pkg.version`)。手動改 commit 時注意衝突。
