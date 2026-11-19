
<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { crearActividadAPI } from '@/services/actividades'
import { obtenerProvinciasAPI, obtenerCiudadesAPI } from '@/services/ubicaciones'

const router = useRouter()

const guardando = ref(false)
const cargandoProvincias = ref(false)
const cargandoCiudades = ref(false)
const error = ref('')
const provincias = ref([])
const ciudades = ref([])
const imagen = ref(null)
const vistaPrevia = ref('')
const archivoImagen = ref(null)

const form = reactive({
  nombre: '',
  descripcion: '',
  categoria: '',
  fecha: '',
  cupo: 1,
  precio: 0,
  provincia: '',
  ciudad: '',
  direccion: '',
})

async function cargarProvincias() {
  cargandoProvincias.value = true
  error.value = ''

  try {
    provincias.value = await obtenerProvinciasAPI()
  } catch (err) {
    error.value = err.message
  } finally {
    cargandoProvincias.value = false
  }
}

async function cargarCiudades() {
  form.ciudad = ''
  ciudades.value = []

  if (!form.provincia) return

  cargandoCiudades.value = true
  error.value = ''

  try {
    ciudades.value = await obtenerCiudadesAPI(form.provincia)
  } catch (err) {
    error.value = err.message
  } finally {
    cargandoCiudades.value = false
  }
}

function seleccionarImagen(evento) {
  const archivo = evento.target.files?.[0] || null
  imagen.value = archivo
  archivoImagen.value = evento.target

  if (vistaPrevia.value) {
    URL.revokeObjectURL(vistaPrevia.value)
    vistaPrevia.value = ''
  }

  if (archivo) {
    vistaPrevia.value = URL.createObjectURL(archivo)
  }
}

onMounted(cargarProvincias)

onBeforeUnmount(() => {
  if (vistaPrevia.value) URL.revokeObjectURL(vistaPrevia.value)
})

async function guardar() {
  if (guardando.value) return

  error.value = ''

  const provincia = provincias.value.find(
    item => item.codigo === form.provincia
  )
  const ciudad = ciudades.value.find(
    item => item.id === Number(form.ciudad)
  )

  if (!provincia || !ciudad) {
    error.value = 'Seleccioná una provincia y una ciudad.'
    return
  }

  guardando.value = true

  try {
    const actividad = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim(),
      fechaInicio: new Date(form.fecha).toISOString(),
      cupo: Number(form.cupo),
      precio: Number(form.precio),
      ubicacion: {
        pais: {
          codigo: 'AR',
          nombre: 'Argentina',
        },
        provincia: {
          codigo: provincia.codigo,
          nombre: provincia.nombre,
        },
        ciudad: {
          idExterno: ciudad.id,
          nombre: ciudad.nombre,
        },
        direccion: form.direccion.trim(),
      },
    }

    await crearActividadAPI(actividad, imagen.value)

    await router.replace({ name: 'admin-actividades' })
  } catch (err) {
    error.value = err.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="editar-actividad">
    <RouterLink :to="{ name: 'admin-actividades' }">← Volver a actividades</RouterLink>

    <h1>Crear actividad</h1>
    <p v-if="error" role="alert">{{ error }}</p>

    <form @submit.prevent="guardar">
      <fieldset :disabled="guardando">
        <label for="crear-nombre">Nombre</label>
        <input
          id="crear-nombre"
          v-model="form.nombre"
          minlength="3"
          maxlength="100"
          required
        />

        <label for="crear-descripcion">Descripción</label>
        <textarea
          id="crear-descripcion"
          v-model="form.descripcion"
          minlength="10"
          maxlength="1000"
          rows="4"
          required
        />

        <label for="crear-categoria">Categoría</label>
        <input
          id="crear-categoria"
          v-model="form.categoria"
          minlength="3"
          maxlength="50"
          required
        />

        <label for="crear-fecha">Fecha y hora</label>
        <input
          id="crear-fecha"
          v-model="form.fecha"
          type="datetime-local"
          :min="new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)"
          required
        />

        <label for="crear-cupo">Cupo</label>
        <input
          id="crear-cupo"
          v-model.number="form.cupo"
          type="number"
          min="1"
          step="1"
          required
        />

        <label for="crear-precio">Precio</label>
        <input
          id="crear-precio"
          v-model.number="form.precio"
          type="number"
          min="0"
          step="0.01"
          required
        />

        <label for="crear-provincia">Provincia</label>
        <select
          id="crear-provincia"
          v-model="form.provincia"
          @change="cargarCiudades"
          :disabled="cargandoProvincias"
          required
        >
          <option value="" disabled>
            {{ cargandoProvincias ? 'Cargando provincias...' : 'Seleccioná una provincia' }}
          </option>
          <option
            v-for="provincia in provincias"
            :key="provincia.codigo"
            :value="provincia.codigo"
          >
            {{ provincia.nombre }}
          </option>
        </select>

        <label for="crear-ciudad">Ciudad</label>
        <select
          id="crear-ciudad"
          v-model="form.ciudad"
          :disabled="!form.provincia || cargandoCiudades"
          required
        >
          <option value="" disabled>
            {{ cargandoCiudades ? 'Cargando ciudades...' : 'Seleccioná una ciudad' }}
          </option>
          <option
            v-for="ciudad in ciudades"
            :key="ciudad.id"
            :value="ciudad.id"
          >
            {{ ciudad.nombre }}
          </option>
        </select>

        <label for="crear-direccion">Dirección</label>
        <input
          id="crear-direccion"
          v-model="form.direccion"
          minlength="5"
          maxlength="200"
          required
        />

        <label for="crear-imagen">Imagen de la actividad</label>
        <input
          id="crear-imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="seleccionarImagen"
        />

        <img
          v-if="vistaPrevia"
          :src="vistaPrevia"
          alt="Vista previa de la imagen"
          class="vista-previa"
        />

        <p>País: Argentina</p>

        <button type="submit" :disabled="guardando">
          {{ guardando ? 'Creando...' : 'Crear actividad' }}
        </button>

        <RouterLink :to="{ name: 'admin-actividades' }">
          Cancelar
        </RouterLink>
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
textarea,
select {
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

.vista-previa {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 8px;
}

[role='alert'] {
  color: #b91c1c;
  margin: 1rem 0;
}
</style>
