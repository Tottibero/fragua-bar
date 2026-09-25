import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { startMutationQueue } from './services/sync-queue.service'
import { registerSW } from 'virtual:pwa-register'

const reloadMarker = 'fragua-bar:reloaded-after-preload-error'

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  if (sessionStorage.getItem(reloadMarker)) return
  sessionStorage.setItem(reloadMarker, 'true')
  window.location.reload()
})

registerSW({ immediate: true })

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
startMutationQueue()
