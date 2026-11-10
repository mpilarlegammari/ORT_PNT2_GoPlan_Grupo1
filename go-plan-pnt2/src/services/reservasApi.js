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
