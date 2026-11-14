import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import GoogleButton from '../GoogleButton.vue'
import useAuthStore from '../../../stores/authStore.js'
import { getGoogleConfig, signInGoogle } from '../../../services/auth.js'

vi.mock('../../../services/auth.js', () => ({
  getGoogleConfig: vi.fn(),
  signInGoogle: vi.fn(),
}))
vi.mock('../../../services/google.js', () => ({ cargarGoogle: vi.fn(async () => {}) }))
let wrapper, callback, auth
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('google', {
    accounts: {
      id: {
        initialize: vi.fn((config) => {
          callback = config.callback
        }),
        renderButton: vi.fn(),
        disableAutoSelect: vi.fn(),
      },
    },
  })
  getGoogleConfig.mockResolvedValue({ clientId: 'client-test', nonce: 'nonce-test' })
})
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})
async function abrir() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: { template: '<div />' } },
      { path: '/registro', component: { template: '<div />' } },
    ],
  })
  await router.push('/registro')
  auth = useAuthStore(pinia)
  wrapper = mount(GoogleButton, { global: { plugins: [pinia, router] } })
  await wrapper.get('button').trigger('click')
  await flushPromises()
  return router
}
it('envía nonce al SDK e inicia sesión en el store compartido desde registro', async () => {
  signInGoogle.mockResolvedValue({ usuario: { nombre: 'Ana', rol: 'usuario' } })
  const router = await abrir()
  expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(
    expect.objectContaining({
      client_id: 'client-test',
      nonce: 'nonce-test',
    }),
  )
  callback({ credential: 'id-token' })
  await flushPromises()
  expect(signInGoogle).toHaveBeenCalledWith({ credential: 'id-token' })
  expect(auth.usuario.nombre).toBe('Ana')
  expect(router.currentRoute.value.path).toBe('/login')
})
it('completa el perfil requerido sin perder la credencial', async () => {
  signInGoogle.mockRejectedValueOnce(
    Object.assign(new Error('Completá tus datos'), { status: 422 }),
  )
  signInGoogle.mockResolvedValueOnce({ usuario: { nombre: 'Ana' } })
  await abrir()
  callback({ credential: 'id-token' })
  await flushPromises()
  await wrapper.get('#google-nombre').setValue('Ana')
  await wrapper.get('#google-apellido').setValue('Pérez')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(signInGoogle).toHaveBeenLastCalledWith({
    credential: 'id-token',
    nombre: 'Ana',
    apellido: 'Pérez',
  })
  expect(auth.usuario.nombre).toBe('Ana')
})
it('muestra errores y descarta callbacks cancelados por login con contraseña', async () => {
  await abrir()
  const anterior = callback
  await wrapper.setProps({ disabled: true })
  anterior({ credential: 'token-tardio' })
  expect(signInGoogle).not.toHaveBeenCalled()
  await wrapper.setProps({ disabled: false })
  getGoogleConfig.mockRejectedValueOnce(new Error('Google sin configurar'))
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(wrapper.get('[role="alert"]').text()).toBe('Google sin configurar')
  expect(wrapper.get('button').text()).toContain('Continuar con Google')
})

