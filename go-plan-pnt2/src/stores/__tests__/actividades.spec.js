import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActividadesStore } from '@/stores/actividades'

describe('useActividadesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('inicializa con las actividades disponibles activas y futuras', () => {
    const store = useActividadesStore()
    expect(store.actividades.length).toBeGreaterThan(0)
    expect(store.actividadesDisponibles.length).toBeGreaterThan(0)
  })

  it('permite alternar favoritos correctamente', () => {
    const store = useActividadesStore()
    const id = store.actividades[0].id

    expect(store.esFavorito(id)).toBe(false)

    // Agrega a favoritos
    store.toggleFavorito(id)
    expect(store.esFavorito(id)).toBe(true)
    expect(store.listaFavoritos.some((a) => a.id === id)).toBe(true)

    // Quita de favoritos
    store.toggleFavorito(id)
    expect(store.esFavorito(id)).toBe(false)
  })

  it('filtra actividades por texto de búsqueda', () => {
    const store = useActividadesStore()
    store.setBusqueda('pastas')

    expect(store.actividadesFiltradas.length).toBeGreaterThan(0)
    expect(
      store.actividadesFiltradas.every(
        (a) =>
          a.nombre.toLowerCase().includes('pastas') ||
          a.descripcion.toLowerCase().includes('pastas'),
      ),
    ).toBe(true)
  })

  it('filtra actividades por categoría seleccionada', () => {
    const store = useActividadesStore()
    store.setCategoria('Gastronomía')

    expect(store.actividadesFiltradas.length).toBeGreaterThan(0)
    expect(store.actividadesFiltradas.every((a) => a.categoria === 'Gastronomía')).toBe(true)
  })

  it('restablece los filtros al reiniciar', () => {
    const store = useActividadesStore()
    store.setBusqueda('algo-que-no-existe')
    store.setCategoria('Gastronomía')

    store.reiniciarFiltros()
    expect(store.busquedaTexto).toBe('')
    expect(store.categoriaSeleccionada).toBe('todas')
  })
})
