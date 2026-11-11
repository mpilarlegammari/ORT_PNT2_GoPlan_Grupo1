/**
 * Funciones de utilidad para interactuar con localStorage de forma segura
 */

export function leerStorage(clave, valorPorDefecto) {
  try {
    const item = localStorage.getItem(clave)
    return item ? JSON.parse(item) : valorPorDefecto
  } catch (error) {
    console.error(`Error leyendo clave "${clave}" de localStorage:`, error)
    return valorPorDefecto
  }
}

export function escribirStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch (error) {
    console.error(`Error guardando clave "${clave}" en localStorage:`, error)
  }
}

