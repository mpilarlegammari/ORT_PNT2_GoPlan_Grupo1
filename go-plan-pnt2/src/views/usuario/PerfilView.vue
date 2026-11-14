<script setup>
import { onMounted, ref } from 'vue'
import { consultarPerfil, guardarPerfil } from '@/services/perfilApi'

const perfil = ref(null)
const cargando = ref(true)
const errorConsulta = ref('')
const borrador = ref(null)
const mensaje = ref('')
const error = ref('')
const guardando = ref(false)

async function cargarPerfil() {
  cargando.value = true
  errorConsulta.value = ''
  try {
    perfil.value = await consultarPerfil()
  } catch (error) {
    errorConsulta.value = error.message || 'No pudimos consultar tu perfil.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarPerfil)

function editarPerfil() {
  const { nombre, apellido, correo } = perfil.value
  borrador.value = { nombre, apellido, correo }
  mensaje.value = ''
  error.value = ''
}

function descartarCambios() {
  borrador.value = null
  error.value = ''
}

async function guardarCambios() {
  if (!borrador.value || guardando.value) return

  const nombre = borrador.value.nombre.trim()
  const apellido = borrador.value.apellido.trim()
  const correo = borrador.value.correo.trim()

  if (!nombre || !apellido || !correo) {
    error.value = 'Completá nombre, apellido y correo.'
    return
  }

  guardando.value = true
  error.value = ''
  try {
    perfil.value = await guardarPerfil({ nombre, apellido, correo })
    borrador.value = null
    mensaje.value = 'Guardaste los cambios de tu perfil.'
  } catch (fallo) {
    error.value = fallo.message || 'No pudimos guardar los cambios. Volvé a intentarlo.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="perfil" aria-labelledby="titulo-perfil">
    <header>
      <h1 id="titulo-perfil">Mi perfil</h1>
      <p>Consultá tus datos personales.</p>
    </header>

    <p v-if="cargando" role="status">Cargando perfil…</p>
    <div v-else-if="errorConsulta">
      <p role="alert">{{ errorConsulta }}</p>
      <button type="button" @click="cargarPerfil">Reintentar</button>
    </div>

    <dl v-else class="datos-perfil">
      <div>
        <dt>Nombre</dt>
        <dd>{{ perfil.nombre }}</dd>
      </div>
      <div>
        <dt>Apellido</dt>
        <dd>{{ perfil.apellido || 'Sin apellido registrado' }}</dd>
      </div>
      <div>
        <dt>Correo electrónico</dt>
        <dd>{{ perfil.correo }}</dd>
      </div>
      <div>
        <dt>Rol</dt>
        <dd>{{ perfil.rol }}</dd>
      </div>
    </dl>

    <div role="status"><p v-if="mensaje">{{ mensaje }}</p></div>

    <button v-if="perfil && !borrador" type="button" @click="editarPerfil">Editar perfil</button>

    <form v-else-if="borrador" class="formulario-perfil" @submit.prevent="guardarCambios">
      <h2>Editar datos personales</h2>
      <div class="campo">
        <label for="perfil-nombre">Nombre</label>
        <input
          id="perfil-nombre"
          v-model="borrador.nombre"
          autocomplete="given-name"
          :disabled="guardando"
          required
        />
      </div>
      <div class="campo">
        <label for="perfil-apellido">Apellido</label>
        <input
          id="perfil-apellido"
          v-model="borrador.apellido"
          autocomplete="family-name"
          :disabled="guardando"
          required
        />
      </div>
      <div class="campo">
        <label for="perfil-correo">Correo electrónico</label>
        <input
          id="perfil-correo"
          v-model="borrador.correo"
          type="email"
          autocomplete="email"
          :disabled="guardando"
          required
        />
      </div>
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="acciones">
        <button type="button" :disabled="guardando" @click="descartarCambios">Descartar</button>
        <button type="submit" :disabled="guardando">
          {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.perfil {
  display: grid;
  gap: 1.5rem;
  min-width: 0;
  padding: 1rem;
}

h1,
h2,
dt {
  font-weight: 600;
}

h2 {
  font-size: 1.2rem;
}

.formulario-perfil,
.campo {
  display: grid;
  gap: 0.5rem;
}

.formulario-perfil {
  gap: 1rem;
}

.acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

input,
button {
  padding: 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font: inherit;
  color: var(--color-text);
  background: var(--color-background);
}

input {
  width: 100%;
  min-width: 0;
}

button {
  justify-self: start;
  cursor: pointer;
  background: var(--color-background-soft);
}

.datos-perfil {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow-wrap: anywhere;
}
</style>
