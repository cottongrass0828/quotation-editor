import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        "name": "專業估價單助手",
        "short_name": "估價單",
        "start_url": ".",
        "display": "standalone",
        "background_color": "#f8fafc",
        "theme_color": "#10b981",
        "icons": [
          {
            "src": "https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }
    })
  ],
  base: process.env.NODE_ENV === 'production'
    ? '/quotation-editor/'
    : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
