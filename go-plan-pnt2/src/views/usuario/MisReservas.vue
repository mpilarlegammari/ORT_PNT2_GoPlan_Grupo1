<script setup>
import { computed, onMounted, ref } from 'vue'
import ReservaCard from '@/components/reservas/ReservaCard.vue'
import { cancelarReservaDemo, consultarReservasDemo } from '@/services/reservasDemo'
import { cancelarReserva, consultarReservas } from '@/services/reservasApi'
import { obtenerErrorCancelacion } from '@/utils/reservas'

const reservas = ref([])
const cargando = ref(true)
const errorConsulta = ref(false)
const usarApi = import.meta.env.VITE_RESERVAS_API === 'true'

async function cargarReservas() {
  cargando.value = true
  errorConsulta.value = false
  try {
    reservas.value = await (usarApi ? consultarReservas() : consultarReservasDemo())
  } catch {
    errorConsulta.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(cargarReservas)

const filtroEstado = ref('todas')
const reservaSeleccionada = ref(null)
const errorCancelacion = ref('')
const mensajeCancelacion = ref('')
const cancelando = ref(false)

function seleccionarReserva(reservaId) {
  if (cancelando.value) return
  mensajeCancelacion.value = ''
  const reserva = reservas.value.find((reserva) => reserva.id === reservaId)
  reservaSeleccionada.value = null
  errorCancelacion.value = usarApi ? '' : obtenerErrorCancelacion(reserva)

  if (errorCancelacion.value) return

  reservaSeleccionada.value = reserva
}

function volver() {
  reservaSeleccionada.value = null
  errorCancelacion.value = ''
}

async function confirmarCancelacion() {
  if (!reservaSeleccionada.value || cancelando.value) return

  cancelando.value = true
  errorCancelacion.value = ''
  try {
    const reservaCancelada = await (usarApi
      ? cancelarReserva(reservaSeleccionada.value.id)
      : cancelarReservaDemo(reservaSeleccionada.value))
    reservas.value = reservas.value.map((reserva) =>
      reserva.id === reservaCancelada.id ? reservaCancelada : reserva,
    )
    mensajeCancelacion.value = `Cancelaste la reserva de ${reservaCancelada.actividad}.`
  } catch (error) {
    errorCancelacion.value = error instanceof Error ? error.message : 'No pudimos cancelar la reserva.'
  } finally {
    reservaSeleccionada.value = null
    cancelando.value = false
  }
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
      <p v-if="!usarApi" class="aviso-demo">
        Datos de ejemplo. Los cambios se reinician al recargar y no modifican cupos reales.
      </p>
    </header>

    <div v-if="!cargando && !errorConsulta && reservas.length" class="filtro-reservas">
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
        <button type="button" :disabled="cancelando" @click="volver">Volver</button>
        <button type="button" :disabled="cancelando" @click="confirmarCancelacion">
          {{ cancelando ? 'Cancelando…' : 'Confirmar cancelación' }}
        </button>
      </div>
    </section>

    <p v-if="cargando" role="status">Cargando reservas…</p>
    <div v-else-if="errorConsulta">
      <p role="alert">No pudimos cargar tus reservas.</p>
      <button type="button" @click="cargarReservas">Reintentar</button>
    </div>
    <p v-else-if="reservas.length === 0">Todavía no tenés reservas.</p>
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
