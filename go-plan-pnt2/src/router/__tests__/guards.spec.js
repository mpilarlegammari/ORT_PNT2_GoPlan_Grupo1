import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { getSession } from '../../services/auth.js'
import useAuthStore from '../../stores/authStore.js'
import { validarAcceso } from '../guards.js'
import appRouter from '../index.js'

vi.mock('../../services/auth.js', () => ({
  getSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))
let router
beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  router = createRouter({ history: createMemoryHistory(), routes: appRouter.options.routes })
  router.beforeEach(validarAcceso)
})

describe('acceso con sesión validada por el backend', () => {
  it.each([
    '/actividades',
    '/actividades/123',
    '/favoritos',
    '/perfil',
    '/mis-reservas',
    '/admin',
    '/admin/actividades/123/editar',
  ])('redirige %s al login si no hay sesión', async (ruta) => {
    getSession.mockRejectedValue(Object.assign(new Error('Sesión vencida'), { status: 401 }))
    await router.push(ruta)
    expect(router.currentRoute.value.name).toBe('login')
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it.each(['/login', '/registro'])('permite %s sin consultar la sesión', async (ruta) => {
    await router.push(ruta)
    expect(router.currentRoute.value.path).toBe(ruta)
    expect(getSession).not.toHaveBeenCalled()
  })

  it('recupera la sesión al abrir una ruta directa y la vuelve a validar al navegar', async () => {
    getSession.mockResolvedValue({ usuario: { nombre: 'Ana', rol: 'usuario' } })
    await router.push('/actividades')
    expect(router.currentRoute.value.name).toBe('actividades')
    expect(useAuthStore().isAuthenticated).toBe(true)
    getSession.mockRejectedValue(Object.assign(new Error('Sesión vencida'), { status: 401 }))
    await router.push('/favoritos')
    expect(getSession).toHaveBeenCalledTimes(2)
    expect(router.currentRoute.value.name).toBe('login')
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it('no confía en el usuario guardado en Pinia si falla la validación remota', async () => {
    useAuthStore().setUser({ nombre: 'Ana', rol: 'usuario' })
    getSession.mockRejectedValue(new Error('Sin conexión'))
    await router.push('/actividades')
    expect(router.currentRoute.value.name).toBe('login')
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it('conserva la autorización de administrador', async () => {
    getSession.mockResolvedValue({ usuario: { nombre: 'Ana', rol: 'usuario' } })
    await router.push('/admin')
    expect(router.currentRoute.value.name).toBe('actividades')
    getSession.mockResolvedValue({ usuario: { nombre: 'Admin', rol: 'admin' } })
    await router.push('/admin')
    expect(router.currentRoute.value.name).toBe('admin-dashboard')
  })
})

it('reserva la edición para el administrador incluso al entrar por URL', async () => {
  getSession.mockResolvedValue({ usuario: { nombre: 'Ana', rol: 'usuario' } })
  await router.push('/admin/actividades/123/editar')
  expect(router.currentRoute.value.name).toBe('actividades')
  getSession.mockResolvedValue({ usuario: { nombre: 'Admin', rol: 'admin' } })
  await router.push('/admin/actividades/123/editar')
  expect(router.currentRoute.value.name).toBe('actividad-editar')
})
