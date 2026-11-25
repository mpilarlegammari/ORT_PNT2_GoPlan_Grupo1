<script setup>
import { onMounted, ref } from 'vue'
import ReservaCard from '@/components/reservas/ReservaCard.vue'
import { consultarReservasAdministrativas, cancelarReservaAdministrativa } from '@/services/reservasApi'

const reservas = ref([])
const cargando = ref(true)
const error = ref('')
const seleccionada = ref(null)
const cancelando = ref(false)
const mensaje = ref('')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    reservas.value = await consultarReservasAdministrativas()
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

async function cancelar() {
  if (!seleccionada.value || cancelando.value) return
  cancelando.value = true
  error.value = ''
  mensaje.value = ''
  try {
    const resultado = await cancelarReservaAdministrativa(seleccionada.value.id)
    reservas.value = reservas.value.map(reserva =>
      reserva.id === resultado.id ? { ...reserva, ...resultado } : reserva,
    )
    seleccionada.value = null
    mensaje.value = 'Reserva cancelada.'
  } catch (err) {
    error.value = err.message
  } finally {
    cancelando.value = false
  }
}

function seleccionar(id) {
  if (cancelando.value) return
  seleccionada.value = reservas.value.find(reserva => reserva.id === id)
  mensaje.value = ''
}

onMounted(cargar)
</script>

<template>
  <section class="admin-reservas" aria-labelledby="titulo-reservas-admin">
    <h1 id="titulo-reservas-admin">Administrar reservas</h1>
    <p v-if="cargando" role="status">Cargando reservas…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="mensaje" role="status">{{ mensaje }}</p>
    <button v-if="error && !seleccionada" type="button" @click="cargar">Reintentar</button>
    <section v-if="seleccionada" aria-labelledby="confirmar-admin">
      <h2 id="confirmar-admin">¿Cancelar la reserva de {{ seleccionada.actividad }}?</h2>
      <p>La reserva quedará cancelada en el historial del titular.</p>
      <button type="button" :disabled="cancelando" @click="seleccionada = null">Volver</button>
      <button type="button" :disabled="cancelando" @click="cancelar">
        {{ cancelando ? 'Cancelando…' : 'Confirmar cancelación' }}
      </button>
    </section>
    <p v-if="!cargando && !error && !reservas.length">Todavía no hay reservas.</p>
    <ul v-if="!cargando && reservas.length">
      <li v-for="reserva in reservas" :key="reserva.id">
        <p>
          <strong>Titular</strong>
          {{ [reserva.titular.nombre, reserva.titular.apellido].filter(Boolean).join(' ') || 'Usuario no disponible' }}
          {{ reserva.titular.email }}
        </p>
        <ReservaCard :reserva="reserva" @solicitar-cancelacion="seleccionar" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.admin-reservas { display: grid; gap: 1rem; padding: 1rem; }
ul { display: grid; gap: 1.5rem; padding: 0; list-style: none; }
button { padding: 0.65rem 1rem; margin: 0.5rem 0.5rem 0 0; cursor: pointer; }
</style>
