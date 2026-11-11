<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import useAuthStore from '../stores/authStore.js'

const auth = useAuthStore()
const { login, restoreSession, logout, loading: cargando, error } = useAuth()
const formValues = reactive({ email: '', password: '' })
const mostrarPassword = ref(false)
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
  <div class="login-page">
    <aside class="presentacion" aria-label="Bienvenido a GoPlan">
      <RouterLink class="logo" to="/">GoPlan<span>.</span></RouterLink>
      <div class="mensaje">
        <h2>Un nuevo plan.<br /><span>Una nueva<br />versión de vos.</span></h2>
        <p>Descubrí eso que te mueve. Un taller, una clase, un momento para hacer algo distinto.</p>
        <div class="invitacion">
          <span class="estrella" aria-hidden="true">✳</span>
          <p>Hacé lugar para<br /><strong>tu próximo plan.</strong></p>
          <span class="etiqueta">Descubrí · Reservá · Viví</span>
        </div>
      </div>
      <footer>Buenos Aires, Argentina</footer>
    </aside>

    <section class="acceso" aria-labelledby="login-titulo">
      <div class="formulario">
        <p class="bajada">TU PRÓXIMO PLAN EMPIEZA ACÁ</p>
        <template v-if="auth.usuario">
          <h1 id="login-titulo">¡Hola, {{ auth.usuario.nombre }}!</h1>
          <p class="descripcion">Ya iniciaste sesión en GoPlan.</p>
          <dl>
            <dt>Email</dt><dd>{{ auth.usuario.email }}</dd>
            <dt>Rol</dt><dd>{{ auth.usuario.rol }}</dd>
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
              <input id="login-email" v-model="formValues.email" type="email" autocomplete="username"
                placeholder="tu@email.com" maxlength="254" required :disabled="cargando" />
            </div>
            <div class="campo">
              <label for="login-password">Contraseña</label>
              <div class="password">
                <input id="login-password" v-model="formValues.password" :type="mostrarPassword ? 'text' : 'password'"
                  placeholder="Ingresá tu contraseña" autocomplete="current-password" maxlength="1024" required :disabled="cargando" />
                <button class="mostrar" type="button" :aria-pressed="mostrarPassword" aria-controls="login-password"
                  @click="mostrarPassword = !mostrarPassword">{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</button>
              </div>
            </div>
            <button class="principal" type="submit" :disabled="cargando">
              {{ cargando ? 'Comprobando…' : 'Iniciar sesión' }}
            </button>
          </form>
          <div class="separador"><span>o continuá con</span></div>
          <button class="google" type="button" :disabled="cargando">
            <span class="google-icono" aria-hidden="true">G</span>
            Continuar con Google
          </button>
          <div class="registro">
            <p>¿Todavía no tenés cuenta?</p>
            <button class="registrarme" type="button" :disabled="cargando">Registrarme</button>
          </div>
        </template>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p class="pie-formulario">Descubrí nuevas experiencias con GoPlan.</p>
        <RouterLink class="volver" to="/">← Volver al inicio</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: #fff; color: #243334; }
.presentacion { background: #235942; color: #fff; padding: 36px clamp(28px, 4vw, 76px); display: flex; flex-direction: column; gap: 48px; }
.logo { color: #fff; font-size: 34px; font-weight: 800; letter-spacing: -2px; width: fit-content; text-decoration: none; }
.logo span { color: #dce9b2; }
.mensaje { margin: auto 0; max-width: 520px; }
h2 { font-size: clamp(36px, 4vw, 60px); font-weight: 750; letter-spacing: -2px; line-height: 1.12; margin-bottom: 22px; }
h2 span { color: #dce9b2; font-weight: inherit; }
.mensaje > p { max-width: 410px; font-size: 16px; line-height: 1.65; color: #e3eee7; }
.invitacion { margin-top: 36px; padding: 26px; background: #dce9b2; color: #235942; border-radius: 70px 70px 16px 16px; }
.estrella { display: block; font-size: 58px; line-height: 1; margin-bottom: 18px; }
.invitacion p { font-size: 26px; line-height: 1.3; }
.invitacion strong { font-weight: 700; }
.etiqueta { display: block; margin-top: 24px; font-size: 13px; }
footer { font-size: 12px; color: #e3eee7; }
.acceso { display: flex; align-items: center; justify-content: center; padding: 64px 36px; }
.formulario { width: 100%; max-width: 440px; }
.bajada { color: #235942; font-size: 12px; font-weight: 700; letter-spacing: 2px; margin-bottom: 16px; }
h1 { font-size: clamp(30px, 3vw, 40px); font-weight: 700; line-height: 1.2; letter-spacing: -1.3px; overflow-wrap: anywhere; }
.descripcion { margin-top: 14px; color: #718080; font-size: 15px; }
form { margin-top: 34px; display: grid; gap: 22px; }
.campo { display: grid; gap: 9px; }
label { font-size: 14px; font-weight: 600; }
input { width: 100%; min-width: 0; height: 54px; border: 1px solid #d9dfd4; border-radius: 8px; padding: 0 15px; background: #fff; color: #243334; font: inherit; }
input::placeholder { color: #768080; }
.password { position: relative; }
.password input { padding-right: 86px; }
button { font: inherit; cursor: pointer; }
.mostrar { position: absolute; right: 14px; top: 0; height: 54px; background: transparent; border: 0; color: #235942; font-size: 13px; }
.principal { width: 100%; min-height: 54px; border: 0; border-radius: 8px; background: #235942; color: #fff; font-weight: 600; padding: 12px 18px; }
.principal:hover { background: #194731; }
button:disabled { opacity: .65; cursor: wait; }
input:focus-visible, button:focus-visible, a:focus-visible { outline: 3px solid #85ae79; outline-offset: 3px; }
.separador { display: flex; align-items: center; gap: 14px; margin: 22px 0; color: #718080; font-size: 13px; }
.separador::before, .separador::after { content: ''; flex: 1; height: 1px; background: #dfe5d7; }
.google { width: 100%; min-height: 52px; display: flex; justify-content: center; align-items: center; gap: 12px; padding: 12px; border: 1px solid #d9dfd4; border-radius: 8px; background: #fff; color: #243334; font-weight: 600; }
.google:hover { background: #f6f8f3; }
.google-icono { color: #4285f4; font-size: 21px; font-weight: 750; }
.registro { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; margin-top: 22px; font-size: 14px; }
.registrarme { padding: 6px 10px; border: 1px solid #235942; border-radius: 6px; background: #fff; color: #235942; font-weight: 600; }
.registrarme:hover { background: #f0f5e7; }
.error { margin-top: 18px; color: #a42c2c; font-size: 14px; }
.pie-formulario { margin-top: 28px; padding-top: 24px; border-top: 1px solid #dfe5d7; color: #718080; font-size: 13px; }
.volver { display: inline-block; color: #235942; font-size: 13px; margin-top: 16px; }
dl { margin: 28px 0; overflow-wrap: anywhere; }
dt { margin-top: 12px; font-weight: 600; }
@media (max-width: 700px) {
  .login-page { grid-template-columns: 1fr; }
  .presentacion { padding: 24px; gap: 24px; }
  .logo { font-size: 28px; }
  h2 { font-size: 34px; letter-spacing: -1px; }
  h2 br { display: none; }
  h2 span::before { content: ' '; }
  .invitacion, footer { display: none; }
  .acceso { padding: 36px 24px; }
}
</style>


