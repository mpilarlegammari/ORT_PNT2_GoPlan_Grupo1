<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { obtenerPaisesAPI, obtenerProvinciasAPI, obtenerCiudadesAPI } from '@/services/ubicaciones'

const props = defineProps({
  inicial: { type: Object, default: null },
  modo: { type: String, default: 'crear' },
  guardando: Boolean,
  cancelar: { type: [String, Object], required: true },
})
const emit = defineEmits(['guardar'])
const ubicacion = props.inicial?.ubicacion
const fechaOriginal = props.inicial?.fechaInicio || props.inicial?.fecha
function fechaLocal(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const fechaInicial = fechaLocal(fechaOriginal)
const form = reactive({
  nombre: props.inicial?.nombre || '',
  descripcion: props.inicial?.descripcion || '',
  categoria: props.inicial?.categoria || '',
  fecha: fechaInicial,
  cupo: props.inicial?.cupo ?? 1,
  precio: props.inicial?.precio ?? 0,
  pais: ubicacion?.pais?.codigo || '',
  provincia: ubicacion?.provincia?.codigo || '',
  ciudad: ubicacion?.ciudad?.idExterno || '',
  direccion: ubicacion?.direccion || '',
})
const paises = ref(ubicacion?.pais ? [{ ...ubicacion.pais }] : [])
const provincias = ref(ubicacion?.provincia ? [{ ...ubicacion.provincia }] : [])
const ciudades = ref(
  ubicacion?.ciudad ? [{ id: ubicacion.ciudad.idExterno, nombre: ubicacion.ciudad.nombre }] : [],
)
const cargandoPaises = ref(false)
const cargandoProvincias = ref(false)
const cargandoCiudades = ref(false)
const erroresUbicacion = reactive({ paises: '', provincias: '', ciudades: '' })
const errorUbicacion = computed(() => Object.values(erroresUbicacion).filter(Boolean).join(' '))
const error = ref('')
const imagen = ref(null)
const vistaPrevia = ref(props.inicial?.imagen || '')
let urlTemporal = ''
let consultaProvincia = 0
let consultaCiudad = 0
let activo = true

async function cargarPaises() {
  cargandoPaises.value = true
  erroresUbicacion.paises = ''
  try {
    const datos = await obtenerPaisesAPI()
    if (!activo) return
    if (ubicacion?.pais && !datos.some((item) => item.codigo === ubicacion.pais.codigo))
      datos.push({ ...ubicacion.pais })
    paises.value = datos
  } catch (err) {
    if (activo) erroresUbicacion.paises = err.message
  } finally {
    if (activo) cargandoPaises.value = false
  }
}
async function cargarProvincias(limpiar = true) {
  const consulta = ++consultaProvincia
  erroresUbicacion.provincias = ''
  if (limpiar) {
    form.provincia = ''
    form.ciudad = ''
    provincias.value = []
    ciudades.value = []
    consultaCiudad++
    cargandoCiudades.value = false
    erroresUbicacion.ciudades = ''
  }
  if (!form.pais) {
    cargandoProvincias.value = false
    return
  }
  cargandoProvincias.value = true
  try {
    const datos = await obtenerProvinciasAPI(form.pais)
    if (!activo || consulta !== consultaProvincia) return
    if (
      !limpiar &&
      form.pais === ubicacion?.pais?.codigo &&
      ubicacion?.provincia &&
      !datos.some((item) => item.codigo === ubicacion.provincia.codigo)
    )
      datos.push({ ...ubicacion.provincia })
    provincias.value = datos
  } catch (err) {
    if (activo && consulta === consultaProvincia) erroresUbicacion.provincias = err.message
  } finally {
    if (activo && consulta === consultaProvincia) cargandoProvincias.value = false
  }
}
async function cargarCiudades(limpiar = true) {
  const consulta = ++consultaCiudad
  erroresUbicacion.ciudades = ''
  if (limpiar) {
    form.ciudad = ''
    ciudades.value = []
  }
  if (!form.pais || !form.provincia) {
    cargandoCiudades.value = false
    return
  }
  cargandoCiudades.value = true
  try {
    const datos = await obtenerCiudadesAPI(form.provincia, form.pais)
    if (!activo || consulta !== consultaCiudad) return
    if (
      !limpiar &&
      form.pais === ubicacion?.pais?.codigo &&
      form.provincia === ubicacion?.provincia?.codigo &&
      ubicacion?.ciudad &&
      !datos.some((item) => item.id === ubicacion.ciudad.idExterno)
    ) {
      datos.push({ id: ubicacion.ciudad.idExterno, nombre: ubicacion.ciudad.nombre })
    }
    ciudades.value = datos
  } catch (err) {
    if (activo && consulta === consultaCiudad) erroresUbicacion.ciudades = err.message
  } finally {
    if (activo && consulta === consultaCiudad) cargandoCiudades.value = false
  }
}
onMounted(() => {
  cargarPaises()
  if (form.pais) cargarProvincias(false)
  if (form.provincia) cargarCiudades(false)
})
onBeforeUnmount(() => {
  activo = false
  if (urlTemporal) URL.revokeObjectURL(urlTemporal)
})

function reintentarUbicaciones() {
  if (erroresUbicacion.paises) cargarPaises()
  if (erroresUbicacion.provincias) cargarProvincias(false)
  if (erroresUbicacion.ciudades) cargarCiudades(false)
}
function seleccionarImagen(evento) {
  const archivo = evento.target.files?.[0] || null
  error.value = ''
  if (
    archivo &&
    (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) ||
      archivo.size > 5 * 1024 * 1024)
  ) {
    error.value = 'Elegí una imagen JPEG, PNG o WebP de hasta 5 MB.'
    evento.target.value = ''
    return
  }
  if (urlTemporal) URL.revokeObjectURL(urlTemporal)
  imagen.value = archivo
  urlTemporal = archivo ? URL.createObjectURL(archivo) : ''
  vistaPrevia.value = urlTemporal || props.inicial?.imagen || ''
}

function guardar() {
  if (props.guardando || cargandoPaises.value || cargandoProvincias.value || cargandoCiudades.value)
    return
  error.value = ''
  const pais = paises.value.find((item) => item.codigo === form.pais)
  const provincia = provincias.value.find((item) => item.codigo === form.provincia)
  const ciudad = ciudades.value.find((item) => item.id === Number(form.ciudad))
  if (!pais || !provincia || !ciudad) {
    error.value = 'Seleccioná un país, una provincia y una ciudad.'
    return
  }
  emit(
    'guardar',
    {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim(),
      // Si no se modificó la fecha se conservan sus segundos y milisegundos.
      fechaInicio:
        fechaOriginal && form.fecha === fechaInicial
          ? fechaOriginal
          : new Date(form.fecha).toISOString(),
      cupo: Number(form.cupo),
      precio: Number(form.precio),
      ubicacion: {
        pais: { ...pais },
        provincia: { codigo: provincia.codigo, nombre: provincia.nombre },
        ciudad: { idExterno: ciudad.id, nombre: ciudad.nombre },
        direccion: form.direccion.trim(),
      },
    },
    imagen.value,
  )
}
</script>

<template>
  <form @submit.prevent="guardar">
    <p v-if="errorUbicacion" role="alert">{{ errorUbicacion }}</p>
    <button
      v-if="errorUbicacion"
      type="button"
      :disabled="guardando"
      @click="reintentarUbicaciones"
    >
      Reintentar ubicaciones
    </button>
    <fieldset :disabled="guardando">
      <label :for="`${modo}-nombre`">Nombre</label>
      <input :id="`${modo}-nombre`" v-model="form.nombre" minlength="3" maxlength="100" required />
      <label :for="`${modo}-descripcion`">Descripción</label>
      <textarea
        :id="`${modo}-descripcion`"
        v-model="form.descripcion"
        minlength="10"
        maxlength="1000"
        rows="4"
        required
      />
      <label :for="`${modo}-categoria`">Categoría</label>
      <input
        :id="`${modo}-categoria`"
        v-model="form.categoria"
        minlength="3"
        maxlength="50"
        required
      />
      <label :for="`${modo}-fecha`">Fecha y hora</label>
      <input
        :id="`${modo}-fecha`"
        v-model="form.fecha"
        type="datetime-local"
        :min="modo === 'crear' ? fechaLocal(Date.now()) : undefined"
        required
      />
      <label :for="`${modo}-cupo`">Cupo</label>
      <input
        :id="`${modo}-cupo`"
        v-model.number="form.cupo"
        type="number"
        min="1"
        step="1"
        required
      />
      <label :for="`${modo}-precio`">Precio</label>
      <input
        :id="`${modo}-precio`"
        v-model.number="form.precio"
        type="number"
        min="0"
        step="0.01"
        required
      />
      <label :for="`${modo}-pais`">País</label>
      <select
        :id="`${modo}-pais`"
        v-model="form.pais"
        :disabled="cargandoPaises"
        required
        @change="cargarProvincias()"
      >
        <option value="" disabled>
          {{ cargandoPaises ? 'Cargando países…' : 'Seleccioná un país' }}
        </option>
        <option v-for="pais in paises" :key="pais.codigo" :value="pais.codigo">
          {{ pais.nombre }}
        </option>
      </select>
      <label :for="`${modo}-provincia`">Provincia</label>
      <select
        :id="`${modo}-provincia`"
        v-model="form.provincia"
        :disabled="!form.pais || cargandoPaises || cargandoProvincias"
        required
        @change="cargarCiudades()"
      >
        <option value="" disabled>
          {{
            cargandoProvincias
              ? 'Cargando provincias…'
              : form.pais && !provincias.length && !erroresUbicacion.provincias
                ? 'No hay provincias disponibles'
                : 'Seleccioná una provincia'
          }}
        </option>
        <option v-for="provincia in provincias" :key="provincia.codigo" :value="provincia.codigo">
          {{ provincia.nombre }}
        </option>
      </select>
      <label :for="`${modo}-ciudad`">Ciudad</label>
      <select
        :id="`${modo}-ciudad`"
        v-model="form.ciudad"
        :disabled="!form.provincia || cargandoProvincias || cargandoCiudades"
        required
      >
        <option value="" disabled>
          {{
            cargandoCiudades
              ? 'Cargando ciudades…'
              : form.provincia && !ciudades.length && !erroresUbicacion.ciudades
                ? 'No hay ciudades disponibles'
                : 'Seleccioná una ciudad'
          }}
        </option>
        <option v-for="ciudad in ciudades" :key="ciudad.id" :value="ciudad.id">
          {{ ciudad.nombre }}
        </option>
      </select>
      <label :for="`${modo}-direccion`">Dirección</label>
      <input
        :id="`${modo}-direccion`"
        v-model="form.direccion"
        minlength="5"
        maxlength="200"
        required
      />
      <label :for="`${modo}-imagen`">Imagen de la actividad</label>
      <input
        :id="`${modo}-imagen`"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="seleccionarImagen"
      />
      <small
        >JPEG, PNG o WebP. Máximo 5 MB.
        {{ modo === 'editar' ? 'Si no elegís otra foto, se conserva la actual.' : '' }}</small
      >
      <img
        v-if="vistaPrevia"
        :src="vistaPrevia"
        alt="Vista previa de la imagen"
        class="vista-previa"
      />

      <p v-if="error" role="alert">{{ error }}</p>
      <button
        type="submit"
        :disabled="guardando || cargandoPaises || cargandoProvincias || cargandoCiudades"
      >
        {{ guardando ? 'Guardando…' : modo === 'editar' ? 'Guardar cambios' : 'Crear actividad' }}
      </button>
      <RouterLink :to="cancelar">Cancelar</RouterLink>
    </fieldset>
  </form>
</template>

<style scoped>
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
