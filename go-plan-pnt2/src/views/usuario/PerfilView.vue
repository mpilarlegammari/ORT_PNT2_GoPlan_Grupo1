<script setup>
import { ref } from 'vue'

// Ejemplo de presentación. El perfil real vendrá de la sesión compartida y la API.
const perfilDemo = ref({
  nombre: 'Alex',
  apellido: 'Ejemplo',
  correo: 'alex@example.com',
  rol: 'Usuario',
})
const borrador = ref(null)
const mensaje = ref('')
const error = ref('')

function editarPerfil() {
  const { nombre, apellido, correo } = perfilDemo.value
  borrador.value = { nombre, apellido, correo }
  mensaje.value = ''
  error.value = ''
}

function descartarCambios() {
  borrador.value = null
  error.value = ''
}

function guardarCambios() {
  const nombre = borrador.value.nombre.trim()
  const apellido = borrador.value.apellido.trim()
  const correo = borrador.value.correo.trim()

  if (!nombre || !apellido || !correo) {
    error.value = 'Completá nombre, apellido y correo.'
    return
  }

  perfilDemo.value = { ...perfilDemo.value, nombre, apellido, correo }
  borrador.value = null
  error.value = ''
  mensaje.value = 'Guardaste los cambios en esta demostración.'
}
</script>

<template>
  <section class="perfil" aria-labelledby="titulo-perfil">
    <header>
      <h1 id="titulo-perfil">Mi perfil</h1>
      <p>Consultá tus datos personales.</p>
      <p class="aviso-demo">
        Perfil ficticio de demostración. Los cambios se reinician al recargar.
      </p>
    </header>

    <dl class="datos-perfil">
      <div>
        <dt>Nombre</dt>
        <dd>{{ perfilDemo.nombre }}</dd>
      </div>
      <div>
        <dt>Apellido</dt>
        <dd>{{ perfilDemo.apellido }}</dd>
      </div>
      <div>
        <dt>Correo electrónico</dt>
        <dd>{{ perfilDemo.correo }}</dd>
      </div>
      <div>
        <dt>Rol</dt>
        <dd>{{ perfilDemo.rol }}</dd>
      </div>
    </dl>

    <div role="status"><p v-if="mensaje">{{ mensaje }}</p></div>

    <button v-if="!borrador" type="button" @click="editarPerfil">Editar perfil</button>

    <form v-else class="formulario-perfil" @submit.prevent="guardarCambios">
      <h2>Editar datos personales</h2>
      <div class="campo">
        <label for="perfil-nombre">Nombre</label>
        <input id="perfil-nombre" v-model="borrador.nombre" autocomplete="given-name" required />
      </div>
      <div class="campo">
        <label for="perfil-apellido">Apellido</label>
        <input id="perfil-apellido" v-model="borrador.apellido" autocomplete="family-name" required />
      </div>
      <div class="campo">
        <label for="perfil-correo">Correo electrónico</label>
        <input id="perfil-correo" v-model="borrador.correo" type="email" autocomplete="email" required />
      </div>
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="acciones">
        <button type="button" @click="descartarCambios">Descartar</button>
        <button type="submit">Guardar cambios</button>
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

.aviso-demo {
  margin-top: 0.5rem;
  font-size: 0.9rem;
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
