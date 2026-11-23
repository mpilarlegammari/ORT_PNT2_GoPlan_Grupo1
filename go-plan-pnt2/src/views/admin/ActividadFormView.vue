<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActividadFormulario from '@/components/actividades/ActividadFormulario.vue'
import { obtenerActividadPorIdAPI, actualizarActividadAPI } from '@/services/actividades'
import { useActividadesStore } from '@/stores/actividades'
const route = useRoute()
const router = useRouter()
const store = useActividadesStore()
const actividad = ref(null)
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
let consulta = 0
async function cargar() {
  const actual = ++consulta
  cargando.value = true
  error.value = ''
  actividad.value = null
  try {
    const datos = await obtenerActividadPorIdAPI(route.params.id, { paraEdicion: true })
    if (actual !== consulta) return
    actividad.value = datos
    if (!datos) error.value = 'Actividad no encontrada.'
  } catch (err) {
    if (actual === consulta) error.value = err.message
  } finally {
    if (actual === consulta) cargando.value = false
  }
}
watch(() => route.params.id, cargar, { immediate: true })
async function guardar(datos, imagen) {
  if (guardando.value) return
  const id = actividad.value.id
  guardando.value = true
  error.value = ''
  try {
    const actualizada = await actualizarActividadAPI(id, datos, imagen)
    store.actualizarActividad(id, actualizada)
    await router.replace({ name: 'actividad-detalle', params: { id } })
  } catch (err) {
    error.value = err.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="actividad-form-vista">
    <RouterLink to="/actividades">← Volver a actividades</RouterLink>
    <h1>Editar actividad</h1>
    <p v-if="cargando" role="status">Cargando actividad…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <button v-if="!cargando && !actividad" type="button" @click="cargar">Reintentar</button>
    <ActividadFormulario
      v-if="actividad && !cargando"
      :key="actividad.id"
      modo="editar"
      :inicial="actividad"
      :guardando="guardando"
      :cancelar="{ name: 'actividad-detalle', params: { id: actividad.id } }"
      @guardar="guardar"
    />
  </section>
</template>

<style scoped src="../../assets/actividad-form.css"></style>
