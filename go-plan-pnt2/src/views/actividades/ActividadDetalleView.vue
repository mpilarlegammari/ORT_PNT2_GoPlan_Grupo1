<script setup>
import EditarActividadButton from '@/components/actividades/EditarActividadButton.vue'
import { computed, ref, watch } from 'vue'
import { obtenerActividadPorIdAPI } from '@/services/actividades'
import { useRoute, RouterLink } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'
import { crearReserva } from '@/services/reservasApi.js'

const route = useRoute()
const store = useActividadesStore()

const actividad = ref(null)
const cargando = ref(false)
const error = ref('')
const reservando = ref(false)
const reservaConfirmada = ref(false)
const errorReserva = ref('')
const avisoDisponibilidad = ref('')
let solicitud = 0

async function cargarActividad(id) {
  const actual = ++solicitud
  cargando.value = true
  error.value = ''
  reservando.value = false
  reservaConfirmada.value = false
  errorReserva.value = ''
  avisoDisponibilidad.value = ''
  actividad.value = null
  try {
    const datos = await obtenerActividadPorIdAPI(id)
    if (actual === solicitud) actividad.value = datos
  } catch (err) {
    if (actual === solicitud) error.value = err.message
  } finally {
    if (actual === solicitud) cargando.value = false
  }
}
watch(() => route.params.id, cargarActividad, { immediate: true })
const esFav = computed(() => (actividad.value ? store.esFavorito(actividad.value.id) : false))
const disponibles = computed(() =>
  Math.max(0, actividad.value.cupo - (actividad.value.cuposReservados ?? 0)),
)

async function reservar() {
  if (reservando.value || reservaConfirmada.value || !actividad.value || disponibles.value === 0) return
  const actual = solicitud
  const id = actividad.value.id
  reservando.value = true
  errorReserva.value = ''
  avisoDisponibilidad.value = ''
  try {
    await crearReserva(id)
    if (actual === solicitud) reservaConfirmada.value = true
  } catch (err) {
    if (actual === solicitud) {
      errorReserva.value = err.status === 401 ? 'Iniciá sesión para reservar.' : err.message
    }
  }
  try {
    if (actual !== solicitud) return
    const actualizada = await obtenerActividadPorIdAPI(id)
    if (actual === solicitud && actualizada) {
      actividad.value = actualizada
      store.actualizarActividad(id, actualizada)
    }
  } catch {
    if (actual === solicitud) avisoDisponibilidad.value = 'No pudimos actualizar la disponibilidad.'
  } finally {
    if (actual === solicitud) reservando.value = false
  }
}
</script>

<template>
  <main class="detalle-vista">
    <nav class="breadcrumb">
      <RouterLink to="/actividades">← Volver al catálogo</RouterLink>
    </nav>

    <p v-if="cargando" role="status">Cargando actividad…</p>
    <div v-else-if="error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="cargarActividad(route.params.id)">Reintentar</button>
    </div>
    <div v-else-if="actividad" class="detalle-contenido">
      <h1>{{ actividad.nombre }}</h1>
      <EditarActividadButton :id="actividad.id" />
      <p class="categoria-tag">{{ actividad.categoria }}</p>
      <img
        v-if="actividad.imagen"
        :src="actividad.imagen"
        :alt="actividad.nombre"
        class="detalle-img"
      />
      <p class="descripcion">{{ actividad.descripcion }}</p>
      <div class="info-extra">
        <p><strong>Ubicación:</strong> {{ actividad.direccion }}, {{ actividad.ciudad }}</p>
        <p v-if="disponibles === 0"><strong>Sin cupos</strong></p>
        <p v-else><strong>Cupos disponibles:</strong> {{ disponibles }}</p>
        <p><strong>Precio:</strong> $ {{ actividad.precio }}</p>
      </div>
      <button
        v-if="!reservaConfirmada"
        type="button"
        :disabled="reservando || disponibles === 0"
        @click="reservar"
      >
        {{ reservando ? 'Reservando…' : 'Reservar' }}
      </button>
      <p v-else role="status">
        Tu reserva está confirmada. <RouterLink to="/mis-reservas">Ver Mis Reservas</RouterLink>
      </p>
      <p v-if="errorReserva" role="alert">{{ errorReserva }}</p>
      <p v-if="avisoDisponibilidad" role="status">{{ avisoDisponibilidad }}</p>
      <button type="button" @click="store.toggleFavorito(actividad.id)">
        {{ esFav ? '❤️ Quitar de favoritos' : '🤍 Guardar en favoritos' }}
      </button>
    </div>

    <div v-else class="no-encontrada">
      <h2>Actividad no encontrada</h2>
      <RouterLink to="/actividades">Volver al catálogo</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.detalle-vista {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
.breadcrumb a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}
.detalle-img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin: 1rem 0;
}
</style>
