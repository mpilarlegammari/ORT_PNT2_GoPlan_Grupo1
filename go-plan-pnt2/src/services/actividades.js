import api from '@/services/api'
import { ACTIVIDADES_INICIALES } from '@/data/actividadesIniciales'

/**
 * Servicio para gestionar las actividades contra la API REST
 */

export async function obtenerActividadesAPI() {
  try {
    const data = await api('/actividades')
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return ACTIVIDADES_INICIALES
  } catch (error) {
    console.warn('No se pudo conectar a /api/actividades, usando datos locales:', error.message)
    return ACTIVIDADES_INICIALES
  }
}

export async function obtenerActividadPorIdAPI(id) {
  try {
    return await api(`/actividades/${id}`)
  } catch (error) {
    console.warn(`No se pudo obtener la actividad ${id} del backend:`, error.message)
    return null
  }
}
