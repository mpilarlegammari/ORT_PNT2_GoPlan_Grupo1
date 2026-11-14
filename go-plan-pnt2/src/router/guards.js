import useAuthStore from '../stores/authStore.js'
import { useAuth } from '../composables/useAuth.js'

// Login y registro son públicos. El resto requiere una sesión vigente del backend.
export async function validarAcceso(to) {
  if (to.meta.acceso) return true

  const auth = useAuthStore()
  const { restoreSession } = useAuth()
  try {
    // Se consulta incluso si Pinia tiene un usuario, por si venció la cookie.
    await restoreSession()
  } catch {
    return { name: 'login', replace: true }
  }

  if (!auth.isAuthenticated) return { name: 'login', replace: true }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'actividades', replace: true }
  }
  return true
}
