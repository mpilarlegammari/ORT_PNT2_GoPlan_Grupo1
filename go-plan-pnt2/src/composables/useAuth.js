import { ref } from 'vue'
import { signIn, getSession, signOut } from '../services/auth.js'
import useAuthStore from '../stores/authStore.js'

export function useAuth() {
  const auth = useAuthStore()
  const loading = ref(false)
  const error = ref('')

  async function ejecutar(operacion) {
    loading.value = true
    error.value = ''
    try {
      return await operacion()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function login(email, password) {
    return ejecutar(async () => {
      const datos = await signIn(email, password)
      auth.setUser(datos.usuario)
    })
  }

  function restoreSession() {
    return ejecutar(async () => {
      try {
        const datos = await getSession()
        auth.setUser(datos.usuario)
      } catch (err) {
        auth.clearUser()
        if (err.status !== 401) throw err
      }
    })
  }

  function logout() {
    return ejecutar(async () => {
      await signOut()
      auth.clearUser()
    })
  }

  return { login, restoreSession, logout, loading, error }
}
