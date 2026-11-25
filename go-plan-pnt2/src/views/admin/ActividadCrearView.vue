<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ActividadFormulario from '@/components/actividades/ActividadFormulario.vue'
import { crearActividadAPI } from '@/services/actividades'
const router = useRouter()
const guardando = ref(false)
const error = ref('')
async function guardar(datos, imagen) {
  if (guardando.value) return
  guardando.value = true
  error.value = ''
  try {
    await crearActividadAPI(datos, imagen)
    await router.replace({ name: 'admin-actividades' })
  } catch (err) {
    error.value = err.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="actividad-form-vista">
    <RouterLink :to="{ name: 'admin-actividades' }">← Volver a actividades</RouterLink>
    <h1>Crear actividad</h1>
    <p v-if="error" role="alert">{{ error }}</p>
    <ActividadFormulario
      :guardando="guardando"
      :cancelar="{ name: 'admin-actividades' }"
      @guardar="guardar"
    />
  </section>
</template>

<style scoped src="../../assets/actividad-form.css"></style>
