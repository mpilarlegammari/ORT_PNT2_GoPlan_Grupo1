import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import PerfilView from '../PerfilView.vue'

const usuario = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', rol: 'usuario' }
let wrapper

afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

it('consulta la sesión y guarda solo los campos editables con el contrato del backend', async () => {
  const consultar = vi.fn()
    .mockResolvedValueOnce(Response.json({ usuario }))
    .mockResolvedValueOnce(Response.json({ usuario: { ...usuario, nombre: 'Ana María' } }))
  vi.stubGlobal('fetch', consultar)
  wrapper = mount(PerfilView)
  await flushPromises()

  expect(consultar).toHaveBeenNthCalledWith(1, '/api/auth/me', { credentials: 'same-origin' })
  expect(wrapper.get('dl').text()).toContain('ana@example.com')
  await wrapper.get('button').trigger('click')
  await wrapper.get('#perfil-nombre').setValue('Ana María')
  await wrapper.get('form').trigger('submit')
  await flushPromises()

  expect(consultar).toHaveBeenNthCalledWith(2, '/api/usuarios/me', {
    credentials: 'same-origin',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana María', apellido: 'Pérez', email: 'ana@example.com' }),
  })
  expect(wrapper.get('dl').text()).toContain('Ana María')
})

it('pide iniciar sesión y oculta la edición cuando la sesión venció', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({}, { status: 401 })))
  wrapper = mount(PerfilView)
  await flushPromises()

  expect(wrapper.get('[role="alert"]').text()).toContain('Iniciá sesión')
  expect(wrapper.find('dl').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('Editar perfil')
})
