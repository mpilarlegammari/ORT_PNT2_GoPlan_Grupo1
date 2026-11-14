import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ACTIVIDADES_INICIALES } from '@/data/actividadesIniciales'
import { leerStorage, escribirStorage } from '@/utils/storage'
import { obtenerActividadesAPI } from '@/services/actividades'

const STORAGE_KEY_ACTIVIDADES = 'goplan_actividades'
const STORAGE_KEY_FAVORITOS = 'goplan_favoritos'

export const useActividadesStore = defineStore('actividades', () => {
  // Estado base
  const actividades = ref(leerStorage(STORAGE_KEY_ACTIVIDADES, ACTIVIDADES_INICIALES))
  const favoritosIds = ref(leerStorage(STORAGE_KEY_FAVORITOS, []))
  const cargando = ref(false)

  // Filtros
  const busquedaTexto = ref('')
  const categoriaSeleccionada = ref('todas')

  // Getters / Computed
  const categorias = computed(() => {
    const set = new Set(actividades.value.map((a) => a.categoria).filter(Boolean))
    return ['todas', ...Array.from(set)]
  })

  // Requerimiento D2: Solo actividades activas y cuya fecha sea futura
  const actividadesDisponibles = computed(() => {
    const ahora = Date.now()
    return actividades.value.filter((act) => {
      if (!act.activa) return false
      const timestamp = Date.parse(act.fecha)
      return Number.isFinite(timestamp) && timestamp > ahora
    })
  })

  // Actividades destacadas para el banner estilo Ticketek
  const actividadesDestacadas = computed(() => {
    return actividadesDisponibles.value.filter((a) => a.destacada)
  })

  // Actividades filtradas por buscador y categoría
  const actividadesFiltradas = computed(() => {
    const texto = busquedaTexto.value.trim().toLowerCase()
    const categoria = categoriaSeleccionada.value

    return actividadesDisponibles.value.filter((act) => {
      const coincideCategoria = categoria === 'todas' || act.categoria === categoria
      const coincideTexto =
        !texto ||
        act.nombre.toLowerCase().includes(texto) ||
        act.descripcion.toLowerCase().includes(texto) ||
        act.ciudad.toLowerCase().includes(texto)

      return coincideCategoria && coincideTexto
    })
  })

  const listaFavoritos = computed(() => {
    return actividades.value.filter((act) => favoritosIds.value.includes(act.id))
  })

  // Acciones - Backend / API
  async function cargarActividades() {
    cargando.value = true
    try {
      const datos = await obtenerActividadesAPI()
      if (datos && datos.length > 0) {
        actividades.value = datos
        escribirStorage(STORAGE_KEY_ACTIVIDADES, datos)
      }
    } finally {
      cargando.value = false
    }
  }

  // Acciones - Favoritos
  function esFavorito(id) {
    return favoritosIds.value.includes(id)
  }

  function toggleFavorito(id) {
    const idx = favoritosIds.value.indexOf(id)
    if (idx >= 0) {
      favoritosIds.value.splice(idx, 1)
    } else {
      favoritosIds.value.push(id)
    }
    escribirStorage(STORAGE_KEY_FAVORITOS, favoritosIds.value)
  }

  // Acciones - Filtros y Búsqueda
  function setBusqueda(texto) {
    busquedaTexto.value = texto
  }

  function setCategoria(cat) {
    categoriaSeleccionada.value = cat
  }

  function reiniciarFiltros() {
    busquedaTexto.value = ''
    categoriaSeleccionada.value = 'todas'
  }

  function obtenerActividadPorId(id) {
    return actividades.value.find((act) => act.id === id) || null
  }

  // Acciones - CRUD (preparadas para la integración de D4 Admin)
  function agregarActividad(nueva) {
    actividades.value.unshift(nueva)
    escribirStorage(STORAGE_KEY_ACTIVIDADES, actividades.value)
  }

  function actualizarActividad(id, cambios) {
    const idx = actividades.value.findIndex((a) => a.id === id)
    if (idx !== -1) {
      actividades.value[idx] = { ...actividades.value[idx], ...cambios }
      escribirStorage(STORAGE_KEY_ACTIVIDADES, actividades.value)
    }
  }

  function toggleActiva(id) {
    const act = obtenerActividadPorId(id)
    if (act) {
      act.activa = !act.activa
      escribirStorage(STORAGE_KEY_ACTIVIDADES, actividades.value)
    }
  }

  return {
    actividades,
    favoritosIds,
    cargando,
    busquedaTexto,
    categoriaSeleccionada,
    categorias,
    actividadesDisponibles,
    actividadesDestacadas,
    actividadesFiltradas,
    listaFavoritos,
    cargarActividades,
    esFavorito,
    toggleFavorito,
    setBusqueda,
    setCategoria,
    reiniciarFiltros,
    obtenerActividadPorId,
    agregarActividad,
    actualizarActividad,
    toggleActiva,
  }
})
