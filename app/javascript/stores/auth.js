import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/sessions/show', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        user.value = data.user
      }
    } catch (error) {
      console.error('認証チェックエラー:', error)
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const data = await response.json()
    user.value = data.user
    return data
  }

  const register = async (userData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ user: userData })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    const data = await response.json()
    user.value = data.user
    return data
  }

  const logout = async () => {
    await fetch('/api/sessions', {
      method: 'DELETE',
      credentials: 'include'
    })
    user.value = null
  }

  return {
    user,
    loading,
    checkAuth,
    login,
    register,
    logout,
    isLoggedIn: computed(() => !!user.value)
  }
})
