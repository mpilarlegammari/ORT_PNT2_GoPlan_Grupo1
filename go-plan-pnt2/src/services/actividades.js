import api from '@/services/api'

// Galería de fotos variadas en alta resolución para que no se repitan
const FOTOS_POR_TEMA = {
  yoga: [
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=85', // Yoga al aire libre
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85', // Postura de meditación
  ],
  mindfulness: [
    'https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=1200&q=85', // Relajación y naturaleza
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=85', // Velas y piedras zen
  ],
  fotografia: [
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1200&q=85', // Fotografía callejera
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85', // Cámara clásica y detalles
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=85', // Fotógrafo encuadrando
  ],
  gastronomia: [
    'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=1200&q=85', // Pastas caseras
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=85', // Amasado artesanal
  ],
  vinos: [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85', // Copas de vino
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=85', // Bodega y degustación
  ],
  ceramica: [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=85', // Torno alfarero
  ],
}

// Resuelve la categoría correcta incluso si en el backend se cargó mal
function resolverCategoria(actividad) {
  const nombre = (actividad.nombre || '').toLowerCase()
  if (nombre.includes('yoga') || nombre.includes('mindful') || nombre.includes('medita')) {
    return 'Bienestar'
  }
  if (nombre.includes('foto') || nombre.includes('cámara')) {
    return 'Fotografía'
  }
  if (
    nombre.includes('pasta') ||
    nombre.includes('cocina') ||
    nombre.includes('vino') ||
    nombre.includes('cata')
  ) {
    return 'Gastronomía'
  }
  if (nombre.includes('cerámica') || nombre.includes('alfarería') || nombre.includes('arte')) {
    return 'Arte y Diseño'
  }
  return actividad.categoria || 'General'
}

// Selecciona una foto única y variada para cada evento
function resolverImagen(actividad) {
  if (actividad.imagen && typeof actividad.imagen === 'string' && actividad.imagen.trim()) {
    return actividad.imagen
  }

  const nombre = (actividad.nombre || '').toLowerCase()
  const idStr = String(actividad._id || actividad.id || '')
  // Hash simple para alternar la foto según el id único de la actividad
  const indice = idStr.length > 0 ? idStr.charCodeAt(idStr.length - 1) : 0

  if (nombre.includes('yoga')) {
    const lista = FOTOS_POR_TEMA.yoga
    return lista[indice % lista.length]
  }
  if (nombre.includes('mindful') || nombre.includes('medita')) {
    const lista = FOTOS_POR_TEMA.mindfulness
    return lista[indice % lista.length]
  }
  if (nombre.includes('foto')) {
    const lista = FOTOS_POR_TEMA.fotografia
    return lista[indice % lista.length]
  }
  if (nombre.includes('vino') || nombre.includes('cata')) {
    const lista = FOTOS_POR_TEMA.vinos
    return lista[indice % lista.length]
  }
  if (nombre.includes('pasta') || nombre.includes('cocina')) {
    const lista = FOTOS_POR_TEMA.gastronomia
    return lista[indice % lista.length]
  }
  if (nombre.includes('cerámica') || nombre.includes('alfarería')) {
    return FOTOS_POR_TEMA.ceramica[0]
  }

  return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85'
}

// Descripción limpia si en el backend se copió texto de pastas en yoga/mindfulness
function resolverDescripcion(actividad) {
  const nombre = (actividad.nombre || '').toLowerCase()
  const desc = actividad.descripcion || ''

  if (nombre.includes('yoga') && desc.toLowerCase().includes('pasta')) {
    return 'Sesión guiada de Hatha y Vinyasa Yoga consciente al aire libre, ideal para estirar, liberar tensiones corporales y reconectar con tu bienestar.'
  }
  if (nombre.includes('mindful') && desc.toLowerCase().includes('pasta')) {
    return 'Práctica de meditación guiada y ejercicios de respiración consciente para calmar el sistema nervioso, reducir el estrés y cultivar la atención plena.'
  }
  return desc
}

// Adapta el modelo del backend al formato que usan las tarjetas y los filtros.
export function adaptarActividad(actividad) {
  const ubicacion = actividad.ubicacion || {}
  const categoriaNormalizada = resolverCategoria(actividad)

  return {
    ...actividad,
    id: actividad._id || actividad.id,
    nombre: actividad.nombre || '',
    descripcion: resolverDescripcion(actividad),
    fecha: actividad.fechaInicio || actividad.fecha,
    imagen: resolverImagen(actividad),
    categoria: categoriaNormalizada,
    ciudad: ubicacion.ciudad?.nombre || actividad.ciudad || '',
    provincia: ubicacion.provincia?.nombre || actividad.provincia || '',
    pais: ubicacion.pais?.nombre || actividad.pais || '',
    direccion: ubicacion.direccion || actividad.direccion || '',
    activa: actividad.activa ?? true,
  }
}

export async function obtenerActividadesAPI() {
  const datos = await api('/actividades')
  if (!Array.isArray(datos)) throw new Error('No se pudo interpretar el listado de actividades.')
  return datos.map(adaptarActividad)
}

export async function obtenerActividadPorIdAPI(id, { paraEdicion = false } = {}) {
  const datos = await api(`/actividades/${encodeURIComponent(id)}`)
  if (!datos?._id && !datos?.id) return null
  const actividad = adaptarActividad(datos)
  // La edición usa los valores originales, sin las correcciones visuales del catálogo.
  return paraEdicion
    ? {
        ...actividad,
        descripcion: datos.descripcion || '',
        categoria: datos.categoria || '',
        imagen: datos.imagen || '',
      }
    : actividad
}

export async function actualizarActividadAPI(id, cambios, imagen) {
  const datos = await api(`/actividades/${encodeURIComponent(id)}`, {
    method: 'PUT',
    ...(imagen
      ? { body: formularioActividad(cambios, imagen) }
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cambios),
        }),
  })
  return adaptarActividad(datos)
}

function formularioActividad(actividad, imagen) {
  const formulario = new FormData()
  formulario.append('actividad', JSON.stringify(actividad))
  if (imagen) formulario.append('imagen', imagen)
  return formulario
}

export async function crearActividadAPI(actividad, imagen) {
  const datos = await api('/actividades', {
    method: 'POST',
    body: formularioActividad(actividad, imagen),
  })
  return adaptarActividad(datos)
}
