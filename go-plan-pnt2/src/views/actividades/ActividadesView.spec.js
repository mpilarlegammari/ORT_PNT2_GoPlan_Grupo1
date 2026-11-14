import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { obtenerActividadesAPI } from '@/services/actividades'
import ActividadesView from './ActividadesView.vue'

vi.mock('@/services/actividades', () => ({ obtenerActividadesAPI: vi.fn() }))

beforeEach(() => {
  setActivePinia(createPinia())
})

it('mantiene visibles las actividades sin cupos', async () => {
  obtenerActividadesAPI.mockResolvedValue([
    {
      id: '1',
      nombre: 'Cerámica',
      categoria: 'Arte',
      descripcion: 'Taller de cerámica',
      fecha: '2099-12-15T18:00:00-03:00',
      ciudad: 'La Plata',
      provincia: 'Buenos Aires',
      cupo: 2,
      cuposReservados: 2,
      activa: true,
    },
    {
      id: '2',
      nombre: 'Fotografía',
      categoria: 'Arte',
      descripcion: 'Taller de fotografía',
      fecha: '2099-12-15T18:00:00-03:00',
      ciudad: 'La Plata',
      provincia: 'Buenos Aires',
      cupo: 3,
      activa: true,
    },
  ])
  const vista = mount(ActividadesView, { global: { stubs: { RouterLink: RouterLinkStub } } })
  await flushPromises()

  const [llena, disponible] = vista.findAll('.actividad-card')
  expect(llena.text()).toContain('Cerámica')
  expect(llena.text()).toContain('Sin cupos')
  expect(disponible.text()).toContain('3 lugares disp.')
})
