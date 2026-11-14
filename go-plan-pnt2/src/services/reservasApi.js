async function solicitarReserva(ruta = '', { method = 'GET', datos } = {}) {
  const respuesta = await fetch(`/api/reservas${ruta}`, {
    method,
    credentials: 'same-origin',
    ...(method === 'GET'
      ? {}
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos ?? {}) }),
  })
  const resultado = await respuesta.json()
  if (!respuesta.ok) {
    throw new Error(resultado.error ?? 'No pudimos procesar la reserva.')
  }
  return resultado
}

export const consultarReservas = () => solicitarReserva()
export const crearReserva = (actividadId) =>
  solicitarReserva('', { method: 'POST', datos: { actividadId } })
export const cancelarReserva = (id) =>
  solicitarReserva(`/${encodeURIComponent(id)}/cancelar`, { method: 'PATCH' })

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
