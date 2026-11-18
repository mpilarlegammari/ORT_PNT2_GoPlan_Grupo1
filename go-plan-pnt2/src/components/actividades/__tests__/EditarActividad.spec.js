import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import useAuthStore from '@/stores/authStore'
import ActividadCard from '../ActividadCard.vue'
import ActividadFormView from '@/views/admin/ActividadFormView.vue'

const actividad = {
  _id: '123',
  id: '123',
  nombre: 'Taller de cerámica',
  descripcion: 'Cerámica para principiantes',
  categoria: 'Arte',
  fechaInicio: '2099-12-15T18:00:00Z',
  fecha: '2099-12-15T18:00:00Z',
  cupo: 10,
  precio: 100,
  ubicacion: {
    pais: { codigo: 'AR', nombre: 'Argentina' },
    provincia: { codigo: 'B', nombre: 'Buenos Aires' },
    ciudad: { idExterno: 1, nombre: 'La Plata' },
    direccion: 'Calle 10 850',
  },
}
let wrapper
beforeEach(() => setActivePinia(createPinia()))
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

it.each([null, 'usuario', 'admin'])('muestra Editar solo para admin: %s', (rol) => {
  if (rol) useAuthStore().setUser({ nombre: 'Ana', rol })
  wrapper = mount(ActividadCard, {
    props: { actividad },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  expect(wrapper.find('.btn-editar').exists()).toBe(rol === 'admin')
  const enlaceEdicion = wrapper
    .findAllComponents(RouterLinkStub)
    .find((enlace) => enlace.props('to')?.name === 'actividad-editar')
  expect(enlaceEdicion?.props('to')).toEqual(
    rol === 'admin'
      ? {
          name: 'actividad-editar',
          params: { id: '123' },
        }
      : undefined,
  )
})

it('guarda cambios con PUT y conserva los códigos de ubicación del backend', async () => {
  const fetchMock = vi.fn(async (_url, opciones) => ({
    ok: true,
    status: 200,
    json: async () =>
      opciones.method === 'PUT' ? { ...actividad, ...JSON.parse(opciones.body) } : actividad,
  }))
  vi.stubGlobal('fetch', fetchMock)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/editar/:id', component: ActividadFormView },
      { path: '/actividades/:id', name: 'actividad-detalle', component: { template: '<div />' } },
      { path: '/actividades', component: { template: '<div />' } },
    ],
  })
  await router.push('/editar/123')
  await router.isReady()
  wrapper = mount(ActividadFormView, { global: { plugins: [router] } })
  await flushPromises()
  await wrapper.get('#editar-nombre').setValue('Cerámica avanzada')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  const [, opciones] = fetchMock.mock.calls.find(([, op]) => op.method === 'PUT')
  expect(JSON.parse(opciones.body)).toMatchObject({
    nombre: 'Cerámica avanzada',
    ubicacion: actividad.ubicacion,
  })
  expect(JSON.parse(opciones.body)).not.toHaveProperty('_id')
})
