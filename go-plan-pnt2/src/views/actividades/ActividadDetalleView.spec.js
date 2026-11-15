import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import ActividadDetalleView from './ActividadDetalleView.vue'

afterEach(() => vi.unstubAllGlobals())

it('confirma la reserva del último lugar, muestra Sin cupos y enlaza al historial', async () => {
  const actividad = { _id: '123', nombre: 'Cerámica', cupo: 1, cuposReservados: 0 }
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json(actividad))
    .mockResolvedValueOnce(Response.json({ id: 'reserva' }, { status: 201 }))
    .mockResolvedValueOnce(Response.json({ ...actividad, cuposReservados: 1 }))
  vi.stubGlobal('fetch', fetchMock)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/actividades/:id', component: ActividadDetalleView },
      { path: '/actividades', component: { template: '<div />' } },
      { path: '/mis-reservas', component: { template: '<div />' } },
    ],
  })
  await router.push('/actividades/123')
  const vista = mount(ActividadDetalleView, { global: { plugins: [createPinia(), router] } })
  try {
    await flushPromises()
    const boton = vista.findAll('button').find((boton) => boton.text() === 'Reservar')
    await boton.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/reservas', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ actividadId: '123' }),
    }))
    expect(vista.text()).toContain('Sin cupos')
    expect(vista.get('[role="status"]').text()).toContain('Tu reserva está confirmada')
    expect(vista.get('a[href="/mis-reservas"]').text()).toContain('Ver Mis Reservas')
  } finally {
    vista.unmount()
  }
})
