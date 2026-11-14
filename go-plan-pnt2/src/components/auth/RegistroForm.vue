<script setup>
import PasswordField from './PasswordField.vue'
import GoogleButton from './GoogleButton.vue'
import { reactive, ref } from 'vue'
import { useAuth } from '../../composables/useAuth.js'

const { register, loading, error } = useAuth()
const formValues = reactive({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmarPassword: '',
})

const googleBusy = ref(false)
const cuentaCreada = ref(false)
const mostrarPassword = ref(false)

async function registrar() {
  if (loading.value || cuentaCreada.value) return
  error.value = ''
  if (formValues.nombre.trim().length < 2 || formValues.apellido.trim().length < 2) {
    error.value = 'Ingresá un nombre y un apellido de al menos 2 caracteres.'
    return
  }
  if (formValues.password !== formValues.confirmarPassword) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  try {
    await register(formValues)
    cuentaCreada.value = true
    formValues.password = ''
    formValues.confirmarPassword = ''
  } catch {
    // useAuth muestra el error del servidor y permite corregir los datos.
  }
}
</script>

<template>
  <div>
    <h1 id="registro-titulo">Creá tu cuenta.</h1>
    <p class="descripcion">Sumate a GoPlan y descubrí nuevas experiencias.</p>
    <div v-if="cuentaCreada" class="registro-exitoso" role="status">
      <p>¡Tu cuenta fue creada! Ya podés iniciar sesión con tu email y contraseña.</p>
      <RouterLink class="registrarme" to="/login">Ir a iniciar sesión</RouterLink>
    </div>
    <form v-else :inert="googleBusy" :aria-busy="loading || googleBusy" @submit.prevent="registrar">
      <fieldset :disabled="loading" class="campos-registro">
        <div class="campo">
          <label for="registro-nombre">Nombre</label>
          <input
            id="registro-nombre"
            v-model="formValues.nombre"
            autocomplete="given-name"
            placeholder="Tu nombre"
            minlength="2"
            maxlength="100"
            required
          />
        </div>
        <div class="campo">
          <label for="registro-apellido">Apellido</label>
          <input
            id="registro-apellido"
            v-model="formValues.apellido"
            autocomplete="family-name"
            placeholder="Tu apellido"
            minlength="2"
            maxlength="100"
            required
          />
        </div>
        <div class="campo">
          <label for="registro-email">Email</label>
          <input
            id="registro-email"
            v-model="formValues.email"
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
            maxlength="254"
            required
          />
        </div>
        <PasswordField
          id="registro-password"
          v-model="formValues.password"
          v-model:visible="mostrarPassword"
          label="Contraseña"
          placeholder="Elegí una contraseña"
          autocomplete="new-password"
          :minlength="8"
          :maxlength="128"
          ayuda="Usá al menos 8 caracteres."
        />
        <PasswordField
          id="registro-confirmacion"
          v-model="formValues.confirmarPassword"
          v-model:visible="mostrarPassword"
          label="Confirmar contraseña"
          placeholder="Repetí tu contraseña"
          autocomplete="new-password"
          :minlength="8"
          :maxlength="128"
        />
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button class="principal" type="submit">
          {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </fieldset>
    </form>
    <GoogleButton v-if="!cuentaCreada" :disabled="loading" @busy="googleBusy = $event" />
    <div class="registro">
      <p>¿Ya tenés cuenta?</p>
      <RouterLink class="registrarme" to="/login">Iniciar sesión</RouterLink>
    </div>
  </div>
</template>
