const ANTICIPACION_MINIMA_MS = 12 * 60 * 60 * 1000

// Validación de interfaz. El backend deberá repetirla con su propio reloj.
export function obtenerErrorCancelacion(reserva, ahora = Date.now()) {
  if (!reserva) return 'No se encontró la reserva.'
  if (reserva.estado !== 'confirmada') return 'Solo se pueden cancelar reservas confirmadas.'

  const inicio = Date.parse(reserva.fechaActividad)
  if (!Number.isFinite(inicio) || !Number.isFinite(ahora)) {
    return 'No se pudo comprobar la fecha de la actividad.'
  }

  if (inicio - ahora < ANTICIPACION_MINIMA_MS) {
    return 'La cancelación requiere al menos 12 horas de anticipación.'
  }

  return ''
}
