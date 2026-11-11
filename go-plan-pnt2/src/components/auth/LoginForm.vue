<script setup>
import PasswordField from './PasswordField.vue'
import GoogleButton from './GoogleButton.vue'
import { onMounted, reactive } from 'vue'
import { useAuth } from '../../composables/useAuth.js'
import useAuthStore from '../../stores/authStore.js'

const auth = useAuthStore()
const { login, restoreSession, logout, loading: cargando, error } = useAuth()
const formValues = reactive({ email: '', password: '' })

onMounted(async () => {
  try {
    await restoreSession()
  } catch {
    // useAuth muestra el error en el formulario.
  }
})

async function ingresar() {
  if (cargando.value) return
  try {
    await login(formValues.email, formValues.password)
    formValues.password = ''
  } catch {
    // Se conserva el email para que el usuario pueda corregir el ingreso.
  }
}

async function salir() {
  if (cargando.value) return
  try {
    await logout()
  } catch {
    // La sesión permanece visible si el servidor no pudo cerrarla.
  }
}
</script>

<template>
  <div>
    <template v-if="auth.usuario">
      <h1 id="login-titulo">¡Hola, {{ auth.usuario.nombre }}!</h1>
      <p class="descripcion">Ya iniciaste sesión en GoPlan.</p>
      <dl>
        <dt>Email</dt>
        <dd>{{ auth.usuario.email }}</dd>
        <dt>Rol</dt>
        <dd>{{ auth.usuario.rol }}</dd>
      </dl>
      <button class="principal" type="button" :disabled="cargando" @click="salir">
        {{ cargando ? 'Cerrando sesión…' : 'Cerrar sesión' }}
      </button>
    </template>
    <template v-else>
      <h1 id="login-titulo">Qué bueno verte.</h1>
      <p class="descripcion">Ingresá a tu cuenta y encontrá tu próximo plan.</p>
      <form :aria-busy="cargando" @submit.prevent="ingresar">
        <div class="campo">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            v-model="formValues.email"
            type="email"
            autocomplete="username"
            placeholder="tu@email.com"
            maxlength="254"
            required
            :disabled="cargando"
          />
        </div>
        <PasswordField
          id="login-password"
          v-model="formValues.password"
          label="Contraseña"
          placeholder="Ingresá tu contraseña"
          autocomplete="current-password"
          :maxlength="1024"
          :disabled="cargando"
        />
        <button class="principal" type="submit" :disabled="cargando">
          {{ cargando ? 'Comprobando…' : 'Iniciar sesión' }}
        </button>
      </form>
      <GoogleButton :disabled="cargando" />
      <div class="registro">
        <p>¿Todavía no tenés cuenta?</p>
        <RouterLink class="registrarme" to="/registro">Registrarme</RouterLink>
      </div>
    </template>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>
