import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import ActividadDetalleView from './ActividadDetalleView.vue'
import useAuthStore from '@/stores/authStore.js'

afterEach(() => vi.unstubAllGlobals())

it('oculta Reservar y el enlace a Mis Reservas al administrador', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({
    _id: '123', nombre: 'Cerámica', cupo: 2,
  })))
  const pinia = createPinia()
  useAuthStore(pinia).setUser({ rol: 'admin' })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/actividades/:id', component: ActividadDetalleView },
      { path: '/actividades', component: { template: '<div />' } },
      { path: '/admin/actividades/:id/editar', name: 'actividad-editar', component: { template: '<div />' } },
    ],
  })
  await router.push('/actividades/123')
  const vista = mount(ActividadDetalleView, { global: { plugins: [pinia, router] } })
  try {
    await flushPromises()
    expect(vista.findAll('button').some(boton => boton.text() === 'Reservar')).toBe(false)
    expect(vista.find('a[href="/mis-reservas"]').exists()).toBe(false)
  } finally {
    vista.unmount()
  }
})

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
  const pinia = createPinia()
  useAuthStore(pinia).setUser({ rol: 'usuario' })
  const vista = mount(ActividadDetalleView, { global: { plugins: [pinia, router] } })
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
