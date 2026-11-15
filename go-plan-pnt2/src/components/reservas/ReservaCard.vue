<script setup>
defineProps({
  reserva: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['solicitar-cancelacion'])

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'long',
  timeZone: 'America/Argentina/Buenos_Aires',
})
const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})

function mostrarFecha(fecha, incluirHora = false) {
  const instante = Date.parse(fecha)
  if (!Number.isFinite(instante)) return 'Fecha no disponible'
  return (incluirHora ? formatoFechaHora : formatoFecha).format(instante)
}
</script>

<template>
  <article class="reserva">
    <h2>{{ reserva.actividad }}</h2>
    <p><strong>Fecha de la actividad:</strong> {{ mostrarFecha(reserva.fechaActividad, true) }}</p>
    <p><strong>Ubicación:</strong> {{ reserva.ubicacion }}</p>
    <p><strong>Reservada el:</strong> {{ mostrarFecha(reserva.fechaReserva) }}</p>
    <p>
      <strong>Estado:</strong>
      {{ reserva.estado === 'confirmada' ? 'Confirmada' : 'Cancelada' }}
    </p>
    <button
      v-if="reserva.estado === 'confirmada'"
      type="button"
      @click="emit('solicitar-cancelacion', reserva.id)"
    >
      Solicitar cancelación
    </button>
    <slot name="acciones" />
  </article>
</template>

<style scoped>
h2,
strong {
  font-weight: 600;
}

h2 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.reserva {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow-wrap: anywhere;
}

button {
  margin-top: 0.75rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font: inherit;
  color: var(--color-text);
  background: var(--color-background-soft);
  cursor: pointer;
}
</style>
