import api from '@/services/api'

// Adapta el modelo del backend al formato que usan las tarjetas y los filtros.
export function adaptarActividad(actividad) {
  const ubicacion = actividad.ubicacion || {}
  return {
    ...actividad,
    id: actividad._id || actividad.id,
    nombre: actividad.nombre || '',
    descripcion: actividad.descripcion || '',
    fecha: actividad.fechaInicio || actividad.fecha,
    ciudad: ubicacion.ciudad?.nombre || actividad.ciudad || '',
    provincia: ubicacion.provincia?.nombre || actividad.provincia || '',
    pais: ubicacion.pais?.nombre || actividad.pais || '',
    direccion: ubicacion.direccion || actividad.direccion || '',
    // El modelo actual del backend no incluye activa: se considera disponible.
    activa: actividad.activa ?? true,
  }
}

export async function obtenerActividadesAPI() {
  const datos = await api('/actividades')
  if (!Array.isArray(datos)) throw new Error('No se pudo interpretar el listado de actividades.')
  return datos.map(adaptarActividad)
}

export async function obtenerActividadPorIdAPI(id) {
  const datos = await api(`/actividades/${encodeURIComponent(id)}`)
  if (!datos?._id && !datos?.id) return null
  return adaptarActividad(datos)
}

export async function actualizarActividadAPI(id, cambios) {
  const datos = await api(`/actividades/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cambios),
  })
  return adaptarActividad(datos)
}
