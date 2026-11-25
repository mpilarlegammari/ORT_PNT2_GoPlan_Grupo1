import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import ActividadFormulario from '../ActividadFormulario.vue'
import { obtenerPaisesAPI, obtenerProvinciasAPI, obtenerCiudadesAPI } from '@/services/ubicaciones'
import { actualizarActividadAPI, crearActividadAPI } from '@/services/actividades'

vi.mock('@/services/ubicaciones', () => ({
  obtenerPaisesAPI: vi.fn(),
  obtenerProvinciasAPI: vi.fn(),
  obtenerCiudadesAPI: vi.fn(),
}))
const inicial = {
  id: '123',
  nombre: 'Cerámica',
  descripcion: 'Taller de cerámica para principiantes',
  categoria: 'Arte',
  fechaInicio: '2099-12-15T18:00:15.123Z',
  cupo: 10,
  precio: 100,
  imagen: 'https://example.com/actual.jpg',
  ubicacion: {
    pais: { codigo: 'AR', nombre: 'Argentina' },
    provincia: { codigo: 'B', nombre: 'Buenos Aires' },
    ciudad: { idExterno: 1, nombre: 'La Plata' },
    direccion: 'Calle 10 850',
  },
}
let wrapper
beforeEach(() => {
  vi.clearAllMocks()
  obtenerPaisesAPI.mockResolvedValue([
    { codigo: 'AR', nombre: 'Argentina' },
    { codigo: 'UY', nombre: 'Uruguay' },
  ])
  obtenerProvinciasAPI.mockResolvedValue([{ codigo: 'B', nombre: 'Buenos Aires' }])
  obtenerCiudadesAPI.mockResolvedValue([{ id: 1, nombre: 'La Plata' }])
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:nueva'), revokeObjectURL: vi.fn() })
})
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

it('precarga la edición con ubicación y foto, y conserva la fecha exacta sin un nuevo archivo', async () => {
  wrapper = mount(ActividadFormulario, {
    props: { inicial, modo: 'editar', cancelar: '/actividades' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  expect(wrapper.get('#editar-provincia').element.value).toBe('B')
  expect(wrapper.get('#editar-ciudad').element.value).toBe('1')
  expect(wrapper.get('img').attributes('src')).toBe(inicial.imagen)
  await wrapper.get('#editar-nombre').setValue('Cerámica avanzada')
  await wrapper.get('form').trigger('submit')
  const [datos, archivo] = wrapper.emitted('guardar')[0]
  expect(datos).toMatchObject({
    nombre: 'Cerámica avanzada',
    ubicacion: inicial.ubicacion,
    fechaInicio: inicial.fechaInicio,
  })
  expect(archivo).toBeNull()
})

it('el mismo formulario crea actividades y emite la foto seleccionada con vista previa', async () => {
  wrapper = mount(ActividadFormulario, {
    props: { cancelar: '/actividades' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  await wrapper.get('#crear-pais').setValue('AR')
  await flushPromises()
  await wrapper.get('#crear-provincia').setValue('B')
  await flushPromises()
  await wrapper.get('#crear-ciudad').setValue('1')
  await wrapper.get('#crear-nombre').setValue('Cerámica')
  await wrapper.get('#crear-fecha').setValue('2099-12-15T18:00')
  const foto = new File(['foto'], 'foto.png', { type: 'image/png' })
  Object.defineProperty(wrapper.get('input[type="file"]').element, 'files', { value: [foto] })
  await wrapper.get('input[type="file"]').trigger('change')
  expect(wrapper.get('img').attributes('src')).toBe('blob:nueva')
  await wrapper.get('form').trigger('submit')
  expect(wrapper.emitted('guardar')[0][1]).toBe(foto)
  wrapper.unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:nueva')
  wrapper = null
})

it('rechaza archivos de otro tipo sin reemplazar la foto actual', async () => {
  wrapper = mount(ActividadFormulario, {
    props: { inicial, modo: 'editar', cancelar: '/actividades' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  Object.defineProperty(wrapper.get('input[type="file"]').element, 'files', {
    value: [new File(['texto'], 'foto.txt', { type: 'text/plain' })],
  })
  await wrapper.get('input[type="file"]').trigger('change')
  expect(wrapper.get('[role="alert"]').text()).toContain('JPEG, PNG o WebP')
  expect(wrapper.get('img').attributes('src')).toBe(inicial.imagen)
})

it('envía foto como multipart al crear y editar, y mantiene JSON al editar sin foto', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => inicial })
  vi.stubGlobal('fetch', fetchMock)
  const foto = new File(['foto'], 'foto.png', { type: 'image/png' })
  const datos = { nombre: 'Cerámica avanzada', ubicacion: inicial.ubicacion }
  await crearActividadAPI(datos, foto)
  await actualizarActividadAPI('123', datos, foto)
  for (const [url, opciones] of fetchMock.mock.calls) {
    expect(url).toMatch(/^\/api\/actividades/)
    expect(opciones.body).toBeInstanceOf(FormData)
    expect(JSON.parse(opciones.body.get('actividad'))).toEqual(datos)
    expect(opciones.body.get('imagen').name).toBe('foto.png')
    expect(opciones.headers).toBeUndefined()
  }
  expect(fetchMock.mock.calls[1][1].method).toBe('PUT')
  await actualizarActividadAPI('123', datos)
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual(datos)
})

it.each(['crear', 'editar'])(
  'cambia de país y guarda los códigos y nombres correctos en %s',
  async (modo) => {
    obtenerProvinciasAPI.mockImplementation(async (pais) =>
      pais === 'UY'
        ? [{ codigo: 'MO', nombre: 'Montevideo' }]
        : [{ codigo: 'B', nombre: 'Buenos Aires' }],
    )
    obtenerCiudadesAPI.mockResolvedValue([{ id: 99, nombre: 'Montevideo' }])
    wrapper = mount(ActividadFormulario, {
      props: { modo, inicial: modo === 'editar' ? inicial : null, cancelar: '/actividades' },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    await flushPromises()
    await wrapper.get(`#${modo}-pais`).setValue('UY')
    await flushPromises()
    expect(wrapper.get(`#${modo}-provincia`).element.value).toBe('')
    expect(wrapper.get(`#${modo}-ciudad`).element.value).toBe('')
    expect(wrapper.get(`#${modo}-ciudad`).element.disabled).toBe(true)
    expect(obtenerProvinciasAPI).toHaveBeenLastCalledWith('UY')
    await wrapper.get(`#${modo}-provincia`).setValue('MO')
    await flushPromises()
    expect(obtenerCiudadesAPI).toHaveBeenLastCalledWith('MO', 'UY')
    await wrapper.get(`#${modo}-ciudad`).setValue('99')
    await wrapper.get(`#${modo}-fecha`).setValue('2099-12-15T18:00')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('guardar')[0][0].ubicacion).toMatchObject({
      pais: { codigo: 'UY', nombre: 'Uruguay' },
      provincia: { codigo: 'MO', nombre: 'Montevideo' },
      ciudad: { idExterno: 99, nombre: 'Montevideo' },
    })
  },
)

it('ignora una respuesta tardía de provincias después de cambiar de país', async () => {
  let resolverArgentina
  obtenerProvinciasAPI.mockImplementation((pais) =>
    pais === 'AR'
      ? new Promise((resolve) => {
          resolverArgentina = resolve
        })
      : Promise.resolve([{ codigo: 'MO', nombre: 'Montevideo' }]),
  )
  wrapper = mount(ActividadFormulario, {
    props: { cancelar: '/actividades' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  await wrapper.get('#crear-pais').setValue('AR')
  await wrapper.get('#crear-pais').setValue('UY')
  await flushPromises()
  resolverArgentina([{ codigo: 'B', nombre: 'Buenos Aires' }])
  await flushPromises()
  expect(wrapper.get('#crear-provincia').text()).toContain('Montevideo')
  expect(wrapper.get('#crear-provincia').text()).not.toContain('Buenos Aires')
})

it('permite reintentar la carga de países si falla el backend', async () => {
  obtenerPaisesAPI.mockRejectedValueOnce(new Error('No se pudieron cargar los países'))
  wrapper = mount(ActividadFormulario, {
    props: { cancelar: '/actividades' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  expect(wrapper.get('[role="alert"]').text()).toContain('No se pudieron cargar los países')
  await wrapper.get('button[type="button"]').trigger('click')
  await flushPromises()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('#crear-pais').text()).toContain('Uruguay')
})
