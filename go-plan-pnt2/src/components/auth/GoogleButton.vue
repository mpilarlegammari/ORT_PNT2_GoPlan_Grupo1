<script setup>
import { ref, reactive, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import useAuthStore from '../../stores/authStore.js'
import { getGoogleConfig, signInGoogle } from '../../services/auth.js'
import { cargarGoogle } from '../../services/google.js'

const props = defineProps({ disabled: Boolean })
const emit = defineEmits(['busy'])
const auth = useAuthStore()
const router = useRouter()
const boton = ref(null)
const iniciado = ref(false)
const ocupado = ref(false)
const completar = ref(false)
const error = ref('')
const perfil = reactive({ nombre: '', apellido: '' })
let credential = null
let version = 0

function limpiar() {
  credential = null
  completar.value = false
  iniciado.value = false
  perfil.nombre = ''
  perfil.apellido = ''
}
function cancelar() {
  version++
  limpiar()
  error.value = ''
  window.google?.accounts?.id.disableAutoSelect()
}
watch(
  () => props.disabled,
  (valor) => {
    if (valor) cancelar()
  },
)
onBeforeUnmount(cancelar)

async function ingresar(datos, actual = version) {
  if (ocupado.value || props.disabled || actual !== version) return
  ocupado.value = true
  emit('busy', true)
  error.value = ''
  try {
    const respuesta = await signInGoogle(datos)
    if (actual !== version) return
    auth.setUser(respuesta.usuario)
    cancelar()
    if (router.currentRoute.value.path !== '/login') await router.push('/login')
  } catch (err) {
    if (actual !== version) return
    error.value = err.message
    if (err.status === 422) completar.value = true
    else limpiar()
  } finally {
    ocupado.value = false
    emit('busy', false)
  }
}

async function iniciar() {
  if (ocupado.value || props.disabled) return
  const actual = ++version
  limpiar()
  error.value = ''
  ocupado.value = true
  emit('busy', true)
  try {
    const { clientId, nonce } = await getGoogleConfig()
    await cargarGoogle()
    if (actual !== version) return
    iniciado.value = true
    await nextTick()
    window.google.accounts.id.initialize({
      client_id: clientId,
      nonce,
      auto_select: false,
      ux_mode: 'popup',
      callback: (respuesta) => {
        if (actual !== version || props.disabled || ocupado.value) return
        credential = respuesta.credential
        ingresar({ credential }, actual)
      },
    })
    window.google.accounts.id.renderButton(boton.value, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      locale: 'es',
    })
  } catch (err) {
    if (actual !== version) return
    limpiar()
    error.value = err.message
  } finally {
    ocupado.value = false
    emit('busy', false)
  }
}
function completarPerfil() {
  if (credential) ingresar({ credential, ...perfil })
}
</script>

<template>
  <div>
    <div class="separador"><span>o continuá con</span></div>
    <div :inert="disabled || ocupado" :aria-busy="ocupado">
      <button
        v-if="!iniciado"
        class="google"
        type="button"
        :disabled="disabled || ocupado"
        @click="iniciar"
      >
        <span class="google-icono" aria-hidden="true">G</span>
        Continuar con Google
      </button>
      <div v-show="iniciado && !completar" ref="boton" class="google-oficial"></div>
      <form v-if="completar" @submit.prevent="completarPerfil">
        <p>Completá tus datos para crear la cuenta con Google.</p>
        <div class="campo">
          <label for="google-nombre">Nombre</label>
          <input
            id="google-nombre"
            v-model="perfil.nombre"
            autocomplete="given-name"
            minlength="2"
            maxlength="100"
            required
          />
        </div>
        <div class="campo">
          <label for="google-apellido">Apellido</label>
          <input
            id="google-apellido"
            v-model="perfil.apellido"
            autocomplete="family-name"
            minlength="2"
            maxlength="100"
            required
          />
        </div>
        <button class="principal" type="submit">Completar registro con Google</button>
      </form>
      <button v-if="iniciado" type="button" class="registrarme" @click="cancelar">Cancelar</button>
    </div>
    <p v-if="ocupado" role="status">Verificando acceso con Google…</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>
