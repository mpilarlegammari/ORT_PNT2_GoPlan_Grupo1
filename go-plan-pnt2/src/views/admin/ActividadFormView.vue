<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerActividadPorIdAPI, actualizarActividadAPI } from '@/services/actividades'
import { useActividadesStore } from '@/stores/actividades'

const route = useRoute()
const router = useRouter()
const store = useActividadesStore()
const actividad = ref(null)
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const form = reactive({
  nombre: '',
  descripcion: '',
  categoria: '',
  fecha: '',
  cupo: 1,
  precio: 0,
  direccion: '',
})

async function cargar() {
  cargando.value = true
  error.value = ''
  actividad.value = null
  try {
    actividad.value = await obtenerActividadPorIdAPI(route.params.id)
    if (!actividad.value) {
      error.value = 'Actividad no encontrada.'
      return
    }
    const fecha = new Date(actividad.value.fecha)
    const fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    Object.assign(form, {
      nombre: actividad.value.nombre,
      descripcion: actividad.value.descripcion,
      categoria: actividad.value.categoria,
      fecha: fechaLocal,
      cupo: actividad.value.cupo,
      precio: actividad.value.precio,
      direccion: actividad.value.direccion,
    })
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}
watch(() => route.params.id, cargar, { immediate: true })

async function guardar() {
  if (guardando.value) return
  guardando.value = true
  error.value = ''
  try {
    const cambios = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim(),
      fechaInicio: new Date(form.fecha).toISOString(),
      cupo: Number(form.cupo),
      precio: Number(form.precio),
      ubicacion: { ...actividad.value.ubicacion, direccion: form.direccion.trim() },
    }
    const actualizada = await actualizarActividadAPI(route.params.id, cambios)
    store.actualizarActividad(actualizada.id, actualizada)
    await router.replace({ name: 'actividad-detalle', params: { id: route.params.id } })
  } catch (err) {
    error.value = err.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="editar-actividad">
    <RouterLink to="/actividades">← Volver a actividades</RouterLink>
    <h1>Editar actividad</h1>
    <p v-if="cargando" role="status">Cargando actividad…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <button v-if="!cargando && !actividad" type="button" @click="cargar">Reintentar</button>
    <form v-if="actividad && !cargando" @submit.prevent="guardar">
      <fieldset :disabled="guardando">
        <label for="editar-nombre">Nombre</label>
        <input id="editar-nombre" v-model="form.nombre" minlength="3" maxlength="100" required />
        <label for="editar-descripcion">Descripción</label>
        <textarea
          id="editar-descripcion"
          v-model="form.descripcion"
          minlength="10"
          maxlength="1000"
          rows="4"
          required
        />
        <label for="editar-categoria">Categoría</label>
        <input
          id="editar-categoria"
          v-model="form.categoria"
          minlength="3"
          maxlength="50"
          required
        />
        <label for="editar-fecha">Fecha y hora</label>
        <input id="editar-fecha" v-model="form.fecha" type="datetime-local" required />
        <label for="editar-cupo">Cupo</label>
        <input id="editar-cupo" v-model="form.cupo" type="number" min="1" step="1" required />
        <label for="editar-precio">Precio</label>
        <input
          id="editar-precio"
          v-model="form.precio"
          type="number"
          min="0"
          step="0.01"
          required
        />
        <label for="editar-direccion">Dirección</label>
        <input
          id="editar-direccion"
          v-model="form.direccion"
          minlength="5"
          maxlength="200"
          required
        />
        <p>{{ actividad.ciudad }}, {{ actividad.provincia }}</p>
        <button type="submit">{{ guardando ? 'Guardando…' : 'Guardar cambios' }}</button>
        <RouterLink :to="{ name: 'actividad-detalle', params: { id: actividad.id } }"
          >Cancelar</RouterLink
        >
      </fieldset>
    </form>
  </section>
</template>

<style scoped>
.editar-actividad {
  max-width: 650px;
  margin: 2rem auto;
  padding: 0 1rem;
}
h1 {
  margin: 1rem 0;
}
fieldset {
  border: 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}
input,
textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
  background: #fff;
  color: #0f172a;
}
label {
  font-weight: 600;
}
button {
  border: 0;
  border-radius: 8px;
  padding: 0.8rem;
  background: #2563eb;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: wait;
}
[role='alert'] {
  color: #b91c1c;
  margin: 1rem 0;
}
</style>
