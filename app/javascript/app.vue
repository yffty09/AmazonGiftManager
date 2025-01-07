<template>
  <div id="app">
    <nav class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-white text-xl font-bold">
          Amazon Gift Card Manager
        </router-link>
        <div class="flex space-x-4">
          <router-link
            v-if="!isLoggedIn"
            to="/login"
            class="text-gray-300 hover:text-white"
          >
            ログイン
          </router-link>
          <button
            v-else
            @click="logout"
            class="text-gray-300 hover:text-white"
          >
            ログアウト
          </button>
        </div>
      </div>
    </nav>
    <div class="container mx-auto p-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()

    return {
      isLoggedIn: computed(() => authStore.isLoggedIn),
      logout: authStore.logout
    }
  }
}
</script>

<style>
#app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>