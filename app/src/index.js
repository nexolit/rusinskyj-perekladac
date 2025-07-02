import { createApp } from 'vue'
import App from './App.vue'
import 'bulma/css/bulma.min.css'
import router from './router'

// Mount app
createApp(App)
    .use(router)
    .mount('#app')

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('serviceworker.js', import.meta.url), {type: 'module'})
}
