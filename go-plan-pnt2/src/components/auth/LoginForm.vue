<script setup>
import PasswordField from './PasswordField.vue'
import GoogleButton from './GoogleButton.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'
import useAuthStore from '../../stores/authStore.js'

const router = useRouter()
const googleBusy = ref(false)
const auth = useAuthStore()
const { login, restoreSession, loading: cargando, error } = useAuth()
const formValues = reactive({ email: '', password: '' })

onMounted(async () => {
  try {
    await restoreSession()
    if (auth.isAuthenticated) await router.replace('/actividades')
  } catch {
    // useAuth muestra el error en el formulario.
  }
})

async function ingresar() {
  if (cargando.value) return
  try {
    await login(formValues.email, formValues.password)
    formValues.password = ''
    await router.replace('/actividades')
  } catch {
    // Se conserva el email para que el usuario pueda corregir el ingreso.
  }
}
</script>

<template>
  <div>
    <h1 id="login-titulo">Qué bueno verte.</h1>
    <p class="descripcion">Ingresá a tu cuenta y encontrá tu próximo plan.</p>
    <form :inert="googleBusy" :aria-busy="cargando || googleBusy" @submit.prevent="ingresar">
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
    <GoogleButton :disabled="cargando" @busy="googleBusy = $event" />
    <div class="registro">
      <p>¿Todavía no tenés cuenta?</p>
      <RouterLink class="registrarme" to="/registro">Registrarme</RouterLink>
    </div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>
