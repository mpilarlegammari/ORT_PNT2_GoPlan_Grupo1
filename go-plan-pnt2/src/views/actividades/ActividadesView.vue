<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api.js'

const actividades = ref([])
const cargando = ref(true)
const error = ref(false)

function cuposDisponibles(actividad) {
  return Math.max(0, actividad.cupo - (actividad.cuposReservados ?? 0))
}

async function cargarActividades() {
  cargando.value = true
  error.value = false
  try {
    actividades.value = await api('/actividades')
  } catch {
    error.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(cargarActividades)
</script>

<template>
  <section aria-labelledby="titulo-actividades">
    <h1 id="titulo-actividades">Actividades</h1>
    <p v-if="cargando" role="status">Cargando actividades…</p>
    <div v-else-if="error">
      <p role="alert">No pudimos cargar las actividades.</p>
      <button type="button" @click="cargarActividades">Reintentar</button>
    </div>
    <p v-else-if="!actividades.length">Todavía no hay actividades.</p>
    <ul v-else>
      <li v-for="actividad in actividades" :key="actividad._id">
        <h2>{{ actividad.nombre }}</h2>
        <p>{{ actividad.descripcion }}</p>
        <p v-if="cuposDisponibles(actividad) === 0"><strong>Sin cupos</strong></p>
        <p v-else>Cupos disponibles: {{ cuposDisponibles(actividad) }}</p>
      </li>
    </ul>
  </section>
</template>
