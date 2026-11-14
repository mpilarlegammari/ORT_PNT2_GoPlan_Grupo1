import { afterEach, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../../../App.vue'
import appRouter from '../../../router/index.js'

let wrapper
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

it('cambia de formulario dentro de la misma página y permite registrar la cuenta', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => ({
      ok: url === '/api/usuarios',
      status: url === '/api/usuarios' ? 201 : 401,
      json: async () =>
        url === '/api/usuarios' ? { usuario: { nombre: 'Ana' } } : { error: 'Sin sesión' },
    })),
  )
  const router = createRouter({ history: createMemoryHistory(), routes: appRouter.options.routes })
  await router.push('/')
  await router.isReady()
  expect(router.currentRoute.value.path).toBe('/login')
  wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  const panel = wrapper.get('.presentacion').element
  expect(wrapper.find('.cabecera').exists()).toBe(false)
  await wrapper.get('#login-password').setValue('clave123')
  await wrapper.get('.mostrar').trigger('click')
  expect(wrapper.get('#login-password').attributes('type')).toBe('text')
  const navegacion = new Promise((resolve) => {
    const detener = router.afterEach(() => {
      detener()
      resolve()
    })
  })
  await wrapper.get('a[href="/registro"]').trigger('click')
  await navegacion
  await flushPromises()
  expect(wrapper.get('.presentacion').element).toBe(panel)
  expect(wrapper.find('#login-email').exists()).toBe(false)
  await wrapper.get('#registro-nombre').setValue('Ana')
  await wrapper.get('#registro-apellido').setValue('Pérez')
  await wrapper.get('#registro-email').setValue('ana@example.com')
  await wrapper.get('#registro-password').setValue('clave123')
  await wrapper.get('#registro-confirmacion').setValue('otraClave')
  await wrapper.get('form').trigger('submit')
  expect(wrapper.get('[role="alert"]').text()).toContain('no coinciden')
  expect(fetch).toHaveBeenCalledTimes(1)
  await wrapper.get('#registro-confirmacion').setValue('clave123')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(wrapper.get('[role="status"]').text()).toContain('Tu cuenta fue creada')
  expect(fetch).toHaveBeenLastCalledWith(
    '/api/usuarios',
    expect.objectContaining({ method: 'POST' }),
  )
  await router.push('/actividades')
  await flushPromises()
  expect(wrapper.find('.auth-page').exists()).toBe(false)
  expect(wrapper.find('.cabecera').exists()).toBe(true)
})

it('lleva a actividades solo cuando el login es correcto', async () => {
  const fetchMock = vi.fn(async (url) => ({
    ok: url === '/api/auth/login',
    status: url === '/api/auth/login' ? 200 : 401,
    json: async () =>
      url === '/api/auth/login'
        ? { usuario: { nombre: 'Ana', email: 'ana@example.com', rol: 'usuario' } }
        : { error: 'Sin sesión' },
  }))
  vi.stubGlobal('fetch', fetchMock)
  const router = createRouter({ history: createMemoryHistory(), routes: appRouter.options.routes })
  await router.push('/login')
  await router.isReady()
  wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  await wrapper.get('#login-email').setValue('ana@example.com')
  await wrapper.get('#login-password').setValue('clave123')
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Credenciales incorrectas' }),
  })
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/login')
  expect(wrapper.get('[role="alert"]').text()).toContain('Credenciales incorrectas')
  const navegacion = new Promise((resolve) => {
    const detener = router.afterEach(() => {
      detener()
      resolve()
    })
  })
  await wrapper.get('form').trigger('submit')
  await navegacion
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/actividades')
  expect(wrapper.find('.auth-page').exists()).toBe(false)
})

it('redirige al home cuando se abre login con una sesión vigente y el logo conserva ese destino', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        url === '/api/auth/me'
          ? { usuario: { nombre: 'Ana', email: 'ana@example.com', rol: 'usuario' } }
          : [],
    })),
  )
  const router = createRouter({ history: createMemoryHistory(), routes: appRouter.options.routes })
  await router.push('/login')
  await router.isReady()
  const navegacion = new Promise((resolve) => {
    const detener = router.afterEach(() => {
      detener()
      resolve()
    })
  })
  wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
  expect(wrapper.text()).not.toContain('Ya iniciaste sesión')
  await navegacion
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/actividades')
  expect(wrapper.find('.auth-page').exists()).toBe(false)
  expect(wrapper.get('.logo-link').attributes('href')).toBe('/actividades')
  await wrapper.get('.logo-link').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.path).toBe('/actividades')
})

it('permite reintentar un logout fallido y vuelve al login al cerrar la sesión', async () => {
  const pinia = createPinia()
  const { default: useAuthStore } = await import('../../../stores/authStore.js')
  const auth = useAuthStore(pinia)
  auth.setUser({ nombre: 'Ana', email: 'ana@example.com', rol: 'usuario' })
  let logoutFalla = true
  const fetchMock = vi.fn(async (url) => {
    if (url === '/api/auth/logout') {
      return {
        ok: !logoutFalla,
        status: logoutFalla ? 500 : 204,
        json: async () => ({ error: 'No se pudo cerrar sesión' }),
      }
    }
    if (url === '/api/auth/me')
      return { ok: false, status: 401, json: async () => ({ error: 'Sin sesión' }) }
    return { ok: true, status: 200, json: async () => [] }
  })
  vi.stubGlobal('fetch', fetchMock)
  const router = createRouter({ history: createMemoryHistory(), routes: appRouter.options.routes })
  await router.push('/actividades')
  await router.isReady()
  wrapper = mount(App, { global: { plugins: [pinia, router] } })
  await flushPromises()
  await wrapper.get('.boton-salir').trigger('click')
  await flushPromises()
  expect(auth.isAuthenticated).toBe(true)
  expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cerrar sesión')
  logoutFalla = false
  const navegacion = new Promise((resolve) => {
    const detener = router.afterEach(() => {
      detener()
      resolve()
    })
  })
  await wrapper.get('.boton-salir').trigger('click')
  await navegacion
  await flushPromises()
  expect(auth.isAuthenticated).toBe(false)
  expect(router.currentRoute.value.path).toBe('/login')
  expect(wrapper.find('.boton-salir').exists()).toBe(false)
  expect(wrapper.find('#login-email').exists()).toBe(true)
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/auth/logout',
    expect.objectContaining({ method: 'POST' }),
  )
})
