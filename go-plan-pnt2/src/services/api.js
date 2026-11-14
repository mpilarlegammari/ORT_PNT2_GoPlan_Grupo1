// Cliente HTTP compartido. /api se conecta a Render mediante el proxy de Vite.
export default async function api(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`/api${ruta}`, { credentials: 'include', ...opciones })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intentá nuevamente.')
  }
  const datos = respuesta.status === 204 ? null : await respuesta.json()
  if (!respuesta.ok) {
    const error = new Error(datos?.error || 'No se pudo completar la solicitud.')
    error.status = respuesta.status
    throw error
  }
  return datos
}
