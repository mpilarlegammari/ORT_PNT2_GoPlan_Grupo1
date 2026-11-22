import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import AdminReservasView from './AdminReservasView.vue'

afterEach(() => vi.unstubAllGlobals())

it('lista titulares y permite confirmar la cancelación conservando el historial', async () => {
  const reserva = {
    id: '123', actividad: 'Cerámica', estado: 'confirmada',
    titular: { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com' },
  }
  const consulta = vi.fn()
    .mockResolvedValueOnce(Response.json([reserva]))
    .mockResolvedValueOnce(Response.json({ id: '123', estado: 'cancelada' }))
  vi.stubGlobal('fetch', consulta)
  const vista = mount(AdminReservasView, { global: { plugins: [createPinia()] } })
  try {
    await flushPromises()
    expect(vista.text()).toContain('Ana Pérez')
    expect(vista.text()).toContain('ana@example.com')
    await vista.get('article button').trigger('click')
    const confirmar = vista.findAll('button').find(boton => boton.text() === 'Confirmar cancelación')
    await confirmar.trigger('click')
    await flushPromises()
    expect(consulta).toHaveBeenLastCalledWith('/api/reservas/admin/123/cancelar',
      expect.objectContaining({ method: 'PATCH', body: '{}' }))
    expect(vista.get('article').text()).toContain('Cancelada')
    expect(vista.get('li').text()).toContain('Ana Pérez')
    expect(vista.find('article button').exists()).toBe(false)
  } finally {
    vista.unmount()
  }
})
