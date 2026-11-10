import { obtenerErrorCancelacion } from '@/utils/reservas'

const reservasDemo = [
  {
    id: 'reserva-demo-1',
    actividad: 'Taller de cerámica',
    fechaActividad: '2026-11-20T18:00:00-03:00',
    ubicacion: 'Palermo, Buenos Aires',
    fechaReserva: '2026-11-09T10:00:00-03:00',
    estado: 'confirmada',
  },
  {
    id: 'reserva-demo-2',
    actividad: 'Fotografía urbana',
    fechaActividad: '2026-11-21T15:00:00-03:00',
    ubicacion: 'San Telmo, Buenos Aires',
    fechaReserva: '2026-11-08T10:00:00-03:00',
    estado: 'cancelada',
  },
]

export async function consultarReservasDemo() {
  // Simula la espera de una consulta y entrega copias para editar en la vista.
  await new Promise((resolver) => setTimeout(resolver, 300))
  return reservasDemo.map((reserva) => ({ ...reserva }))
}

export async function cancelarReservaDemo(reserva) {
  const error = obtenerErrorCancelacion(reserva)
  if (error) throw new Error(error)

  await new Promise((resolver) => setTimeout(resolver, 300))
  return { ...reserva, estado: 'cancelada' }
}
