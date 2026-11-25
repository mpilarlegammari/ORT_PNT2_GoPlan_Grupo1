import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

import { leerStorage, escribirStorage } from '@/utils/storage'
import { obtenerActividadesAPI } from '@/services/actividades'
import useAuthStore from '@/stores/authStore'

export const useActividadesStore = defineStore('actividades', () => {
  const authStore = useAuthStore()

  // Clave dinámica según el usuario conectado
  function obtenerClaveFavoritos() {
    const usuario = authStore.usuario
    const idUsuario = usuario?.id || usuario?._id || usuario?.email
    return idUsuario ? `goplan_favoritos_${idUsuario}` : 'goplan_favoritos_invitado'
  }

  // Estado base
  const actividades = ref([])
  const favoritosIds = ref(leerStorage(obtenerClaveFavoritos(), []))
  const cargando = ref(false)
  const error = ref('')

  function sincronizarFavoritos() {
    favoritosIds.value = leerStorage(obtenerClaveFavoritos(), [])
  }

  // Sincronizar automáticamente cuando cambie el usuario en authStore
  watch(
    () => authStore.usuario,
    () => {
      sincronizarFavoritos()
    },
    { deep: true },
  )

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
    error.value = ''
    try {
      const datos = await obtenerActividadesAPI()
      actividades.value = Array.isArray(datos) ? datos : []
    } catch (err) {
      error.value = err.message || 'No se pudieron cargar las actividades.'
    } finally {
      cargando.value = false
    }
  }

  // Acciones - Favoritos
  const mensajeNotificacion = ref('')
  const notificacionVisible = ref(false)
  let notificacionTimer = null

  function mostrarNotificacion(texto) {
    mensajeNotificacion.value = texto
    notificacionVisible.value = true
    if (notificacionTimer) clearTimeout(notificacionTimer)
    notificacionTimer = setTimeout(() => {
      notificacionVisible.value = false
    }, 2400)
  }

  function esFavorito(id) {
    return favoritosIds.value.includes(id)
  }

  function toggleFavorito(id) {
    const idx = favoritosIds.value.indexOf(id)
    const act = actividades.value.find((a) => a.id === id)
    const nombre = act?.nombre ? `"${act.nombre}"` : 'Actividad'
    if (idx >= 0) {
      favoritosIds.value.splice(idx, 1)
      mostrarNotificacion(`${nombre} eliminada de favoritos`)
    } else {
      favoritosIds.value.push(id)
      mostrarNotificacion(`${nombre} guardada en favoritos`)
    }
    escribirStorage(obtenerClaveFavoritos(), favoritosIds.value)
  }

  function vaciarFavoritos() {
    favoritosIds.value = []
    escribirStorage(obtenerClaveFavoritos(), [])
    mostrarNotificacion('Lista de favoritos vaciada')
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

  // Acciones - CRUD
  function agregarActividad(nueva) {
    actividades.value.unshift(nueva)
  }

  function actualizarActividad(id, cambios) {
    const idx = actividades.value.findIndex((a) => a.id === id)
    if (idx !== -1) {
      actividades.value[idx] = { ...actividades.value[idx], ...cambios }
    }
  }

  function toggleActiva(id) {
    const act = obtenerActividadPorId(id)
    if (act) {
      act.activa = !act.activa
    }
  }

  return {
    actividades,
    favoritosIds,
    cargando,
    error,
    busquedaTexto,
    categoriaSeleccionada,
    categorias,
    actividadesDisponibles,
    actividadesDestacadas,
    actividadesFiltradas,
    listaFavoritos,
    cargarActividades,
    sincronizarFavoritos,
    esFavorito,
    toggleFavorito,
    vaciarFavoritos,
    mensajeNotificacion,
    notificacionVisible,
    setBusqueda,
    setCategoria,
    reiniciarFiltros,
    obtenerActividadPorId,
    agregarActividad,
    actualizarActividad,
    toggleActiva,
  }
})
