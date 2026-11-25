import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { eliminarActividadAPI, obtenerActividadesAPI } from '@/services/actividades'
import AdminActividadesView from './AdminActividadesView.vue'

vi.mock('@/services/actividades', () => ({
  eliminarActividadAPI: vi.fn(),
  obtenerActividadesAPI: vi.fn(),
}))

const actividad = {
  id: 'actividad-1',
  nombre: 'Taller de cerámica',
  categoria: 'Arte',
  ciudad: 'La Plata',
  fecha: '2099-12-15T18:00:00-03:00',
  cupo: 12,
  precio: 1000,
  activa: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('confirm', vi.fn())
  obtenerActividadesAPI.mockResolvedValue([{ ...actividad }])
})

it('confirma la eliminación, consume el servicio y quita la actividad tras el éxito', async () => {
  window.confirm.mockReturnValue(true)
  eliminarActividadAPI.mockResolvedValue(null)
  const vista = mount(AdminActividadesView, { global: { stubs: { RouterLink: RouterLinkStub } } })
  await flushPromises()

  await vista.get('.boton-eliminar').trigger('click')
  await flushPromises()

  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('sus reservas confirmadas serán canceladas'))
  expect(eliminarActividadAPI).toHaveBeenCalledWith('actividad-1')
  expect(vista.text()).not.toContain('Taller de cerámica')
  expect(vista.text()).toContain('Todavía no hay actividades registradas.')
})

it('no llama al backend si se cancela la confirmación', async () => {
  window.confirm.mockReturnValue(false)
  const vista = mount(AdminActividadesView, { global: { stubs: { RouterLink: RouterLinkStub } } })
  await flushPromises()

  await vista.get('.boton-eliminar').trigger('click')

  expect(eliminarActividadAPI).not.toHaveBeenCalled()
  expect(vista.text()).toContain('Taller de cerámica')
})

it('muestra el error y conserva la actividad cuando falla la eliminación', async () => {
  window.confirm.mockReturnValue(true)
  eliminarActividadAPI.mockRejectedValue(new Error('No autorizado para eliminar actividades'))
  const vista = mount(AdminActividadesView, { global: { stubs: { RouterLink: RouterLinkStub } } })
  await flushPromises()

  await vista.get('.boton-eliminar').trigger('click')
  await flushPromises()

  expect(vista.get('[role="alert"]').text()).toContain('No autorizado para eliminar actividades')
  expect(vista.text()).toContain('Taller de cerámica')
})
