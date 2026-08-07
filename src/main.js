import {
    createApp
} from 'vue'
import App from './App.vue'
import { Capacitor } from '@capacitor/core'

createApp(App).mount('#app')

// Service Worker 僅供 Web/PWA 環境使用；原生 App 有獨立的 Preferences 儲存與更新機制，不應註冊 SW
if (!Capacitor.isNativePlatform()) {
    import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({ immediate: true })
    })
}