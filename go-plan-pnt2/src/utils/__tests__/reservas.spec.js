import { describe, expect, it } from 'vitest'
import { obtenerErrorCancelacion } from '../reservas'

const reserva = {
  estado: 'confirmada',
  fechaActividad: '2026-11-20T18:00:00-03:00',
}

describe('Plazo de cancelación', () => {
  it.each([
    ['más de 12 horas', '2026-11-20T05:59:59-03:00', true],
    ['exactamente 12 horas', '2026-11-20T06:00:00-03:00', true],
    ['menos de 12 horas', '2026-11-20T06:00:01-03:00', false],
    ['actividad iniciada', '2026-11-20T18:00:00-03:00', false],
    ['actividad pasada', '2026-11-21T18:00:00-03:00', false],
    ['mismo límite expresado en UTC', '2026-11-20T09:00:00Z', true],
  ])('%s', (_caso, ahora, permitida) => {
    expect(obtenerErrorCancelacion(reserva, Date.parse(ahora)) === '').toBe(permitida)
  })

  it('rechaza una reserva ya cancelada', () => {
    expect(obtenerErrorCancelacion({ ...reserva, estado: 'cancelada' }, 0)).not.toBe('')
  })

  it('rechaza una fecha inválida', () => {
    expect(obtenerErrorCancelacion({ ...reserva, fechaActividad: 'sin fecha' }, 0)).not.toBe('')
  })

  it('rechaza una reserva inexistente', () => {
    expect(obtenerErrorCancelacion(undefined, 0)).not.toBe('')
  })
})
