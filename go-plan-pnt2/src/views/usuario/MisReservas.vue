<script setup>
import { computed, ref } from 'vue'
import ReservaCard from '@/components/reservas/ReservaCard.vue'
import { obtenerErrorCancelacion } from '@/utils/reservas'

// Datos de demostración para esta vista. No representan aún el contrato de la API.
const reservas = ref([
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
])

const filtroEstado = ref('todas')
const reservaSeleccionada = ref(null)
const errorCancelacion = ref('')
const mensajeCancelacion = ref('')

function seleccionarReserva(reservaId) {
  mensajeCancelacion.value = ''
  const reserva = reservas.value.find((reserva) => reserva.id === reservaId)
  reservaSeleccionada.value = null
  errorCancelacion.value = obtenerErrorCancelacion(reserva)

  if (errorCancelacion.value) return

  reservaSeleccionada.value = reserva
}

function volver() {
  reservaSeleccionada.value = null
  errorCancelacion.value = ''
}

function confirmarCancelacion() {
  if (!reservaSeleccionada.value) return

  const reserva = reservas.value.find((reserva) => reserva.id === reservaSeleccionada.value.id)
  errorCancelacion.value = obtenerErrorCancelacion(reserva)

  if (errorCancelacion.value) {
    reservaSeleccionada.value = null
    return
  }

  // Simulación local: la operación real deberá confirmarse primero en el backend.
  reserva.estado = 'cancelada'
  mensajeCancelacion.value = `Cancelaste la reserva de ${reserva.actividad} en esta demostración.`
  reservaSeleccionada.value = null
}

const reservasFiltradas = computed(() => {
  if (filtroEstado.value === 'todas') {
    return reservas.value
  }

  return reservas.value.filter((reserva) => reserva.estado === filtroEstado.value)
})
</script>

<template>
  <section class="mis-reservas" aria-labelledby="titulo-reservas">
    <header>
      <h1 id="titulo-reservas">Mis reservas</h1>
      <p>Consultá tus actividades y el historial de tus reservas.</p>
      <p class="aviso-demo">
        Datos de ejemplo. Los cambios se reinician al recargar y no modifican cupos reales.
      </p>
    </header>

    <div class="filtro-reservas">
      <label for="filtro-estado">Filtrar por estado</label>
      <select id="filtro-estado" v-model="filtroEstado">
        <option value="todas">Todas</option>
        <option value="confirmada">Confirmadas</option>
        <option value="cancelada">Canceladas</option>
      </select>
    </div>

    <div role="status">
      <p v-if="errorCancelacion">{{ errorCancelacion }}</p>
      <p v-else-if="mensajeCancelacion">{{ mensajeCancelacion }}</p>
    </div>

    <section v-if="reservaSeleccionada" class="confirmacion" aria-labelledby="titulo-confirmacion">
      <h2 id="titulo-confirmacion">¿Cancelar la reserva de {{ reservaSeleccionada.actividad }}?</h2>
      <p>La reserva cancelada permanecerá en tu historial.</p>
      <div class="acciones-confirmacion">
        <button type="button" @click="volver">Volver</button>
        <button type="button" @click="confirmarCancelacion">Confirmar cancelación</button>
      </div>
    </section>

    <p v-if="reservas.length === 0">Todavía no tenés reservas.</p>
    <p v-else-if="reservasFiltradas.length === 0">No hay reservas para este filtro.</p>

    <ul v-else class="lista-reservas">
      <li v-for="reserva in reservasFiltradas" :key="reserva.id">
        <ReservaCard :reserva="reserva" @solicitar-cancelacion="seleccionarReserva" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.mis-reservas {
  display: grid;
  gap: 1.5rem;
  min-width: 0;
  padding: 1rem;
}

h1,
h2 {
  font-weight: 600;
}

.confirmacion {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
}

.confirmacion h2 {
  font-size: 1.2rem;
}

.acciones-confirmacion {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

button {
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font: inherit;
  color: var(--color-text);
  background: var(--color-background-soft);
  cursor: pointer;
}

.aviso-demo {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.lista-reservas {
  display: grid;
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.filtro-reservas {
  display: grid;
  gap: 0.5rem;
}

select {
  width: 100%;
  max-width: 20rem;
  padding: 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font: inherit;
  color: var(--color-text);
  background: var(--color-background);
}

</style>
