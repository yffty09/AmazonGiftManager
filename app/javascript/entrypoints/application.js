import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../app.vue'

// ルーター設定
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ルートは後で追加
  ]
})

// Piniaストア
const pinia = createPinia()

// Vueアプリケーションの作成
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
