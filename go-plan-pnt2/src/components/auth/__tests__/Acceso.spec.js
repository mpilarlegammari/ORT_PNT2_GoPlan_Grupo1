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
  await router.push('/login')
  await router.isReady()
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
  await router.push('/')
  await flushPromises()
  expect(wrapper.find('.auth-page').exists()).toBe(false)
  expect(wrapper.find('.cabecera').exists()).toBe(true)
})
