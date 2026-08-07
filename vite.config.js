import {
  fileURLToPath,
  URL
} from 'node:url'

import {
  defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {
  VitePWA
} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      // 改為手動註冊（見 src/main.js），原生 App 環境不應註冊 Service Worker
      injectRegister: false,
      // 需要 Workbox (預設值即可)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
    })
  ],
  base: process.env.CAP_BUILD ? './' :
    (process.env.NODE_ENV === 'production' ? '/quotation-editor/' : '/'),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})