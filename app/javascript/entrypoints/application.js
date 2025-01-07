import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../app.vue'
import GiftCardList from '../components/GiftCardList.vue'
import GiftCardForm from '../components/GiftCardForm.vue'
import LoginForm from '../components/LoginForm.vue'

// ルーター設定
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: GiftCardList },
    { path: '/new', component: GiftCardForm },
    { path: '/login', component: LoginForm },
  ]
})

// Piniaストア
const pinia = createPinia()

// Vueアプリケーションの作成
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')