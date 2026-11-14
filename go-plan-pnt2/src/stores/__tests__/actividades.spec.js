import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActividadesStore } from '@/stores/actividades'

const actividadAPI = {
  _id: '507f1f77bcf86cd799439012',
  nombre: 'Taller de pastas',
  descripcion: 'Pastas caseras',
  categoria: 'Gastronomía',
  fechaInicio: '2099-12-15T18:00:00Z',
  precio: 100,
  cupo: 10,
  ubicacion: {
    ciudad: { nombre: 'La Plata' },
    provincia: { nombre: 'Buenos Aires' },
    pais: { nombre: 'Argentina' },
    direccion: 'Calle 10 850',
  },
}
function responder(datos) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => datos }),
  )
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())

describe('catálogo del backend', () => {
  it('ignora las actividades antiguas guardadas en el navegador', () => {
    localStorage.setItem('goplan_actividades', JSON.stringify([{ id: 'demo' }]))
    expect(useActividadesStore().actividades).toEqual([])
  })

  it('adapta id, fecha y ubicación, permite filtrar y conservar favoritos por id real', async () => {
    responder([
      actividadAPI,
      { ...actividadAPI, _id: 'pasada', fechaInicio: '2000-01-01' },
      { ...actividadAPI, _id: 'inactiva', activa: false },
    ])
    const store = useActividadesStore()
    await store.cargarActividades()
    expect(fetch).toHaveBeenCalledWith(
      '/api/actividades',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(store.actividadesDisponibles).toHaveLength(1)
    expect(store.actividadesDisponibles[0]).toMatchObject({
      id: actividadAPI._id,
      fecha: actividadAPI.fechaInicio,
      ciudad: 'La Plata',
      provincia: 'Buenos Aires',
      activa: true,
    })
    store.setBusqueda('la plata')
    store.setCategoria('Gastronomía')
    expect(store.actividadesFiltradas).toHaveLength(1)
    store.toggleFavorito(actividadAPI._id)
    expect(store.listaFavoritos[0].id).toBe(actividadAPI._id)
    store.toggleFavorito(actividadAPI._id)
    expect(store.listaFavoritos).toEqual([])
    store.setBusqueda('inexistente')
    expect(store.actividadesFiltradas).toEqual([])
    store.reiniciarFiltros()
    expect(store.actividadesFiltradas).toHaveLength(1)
  })

  it('una respuesta vacía limpia el listado anterior y no muestra datos de demostración', async () => {
    responder([actividadAPI])
    const store = useActividadesStore()
    await store.cargarActividades()
    responder([])
    await store.cargarActividades()
    expect(store.actividades).toEqual([])
    expect(store.error).toBe('')
  })

  it('muestra el fallo de red y permite reintentar sin datos de demostración', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Sin red')))
    const store = useActividadesStore()
    await store.cargarActividades()
    expect(store.error).toContain('No se pudo conectar')
    expect(store.actividades).toEqual([])
    expect(store.cargando).toBe(false)
    responder([actividadAPI])
    await store.cargarActividades()
    expect(store.error).toBe('')
    expect(store.actividadesDisponibles).toHaveLength(1)
  })
})
