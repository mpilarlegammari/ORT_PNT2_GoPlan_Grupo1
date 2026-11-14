import { defineStore } from 'pinia'

const useAuthStore = defineStore('auth', {
  state: () => ({ usuario: null }),
  getters: {
    isAuthenticated: (state) => !!state.usuario,
    isAdmin: (state) => state.usuario?.rol === 'admin',
  },
  actions: {
    setUser(usuario) {
      this.usuario = usuario
    },
    clearUser() {
      this.usuario = null
    },
  },
})

export default useAuthStore
