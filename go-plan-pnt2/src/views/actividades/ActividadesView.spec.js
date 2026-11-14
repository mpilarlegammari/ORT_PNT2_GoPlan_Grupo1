import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import api from '@/services/api.js'
import ActividadesView from './ActividadesView.vue'

vi.mock('@/services/api.js', () => ({ default: vi.fn() }))

it('mantiene visibles las actividades sin cupos', async () => {
  api.mockResolvedValue([
    { _id: '1', nombre: 'Cerámica', cupo: 2, cuposReservados: 2 },
    { _id: '2', nombre: 'Fotografía', cupo: 3 },
  ])
  const vista = mount(ActividadesView)
  await flushPromises()

  const [llena, disponible] = vista.findAll('li')
  expect(llena.text()).toContain('Cerámica')
  expect(llena.text()).toContain('Sin cupos')
  expect(disponible.text()).toContain('Cupos disponibles: 3')
})
