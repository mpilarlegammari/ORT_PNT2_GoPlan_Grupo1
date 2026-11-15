import api from './api.js'

export const consultarReservas = () => api('/reservas')
export const crearReserva = (actividadId) =>
  api('/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actividadId }),
  })
export const cancelarReserva = (id) =>
  api(`/reservas/${encodeURIComponent(id)}/cancelar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })

export async function descargarComprobante(id) {
  const respuesta = await fetch(`/api/reservas/${encodeURIComponent(id)}/comprobante`, {
    credentials: 'same-origin',
  })
  if (!respuesta.ok || !respuesta.headers.get('Content-Type')?.startsWith('application/pdf')) {
    const datos = await respuesta.json().catch(() => null)
    throw new Error(datos?.error ?? 'No pudimos descargar el comprobante.')
  }
  const url = URL.createObjectURL(await respuesta.blob())
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `reserva-${id}.pdf`
  enlace.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
