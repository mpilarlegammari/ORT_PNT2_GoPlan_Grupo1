<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import logoBlanco from '@/assets/logo-blanco.svg'
import { useActividadesStore } from '@/stores/actividades'
import useAuthStore from '@/stores/authStore'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { logout, loading: cerrandoSesion, error: errorSesion } = useAuth()

async function cerrarSesion() {
  if (cerrandoSesion.value) return
  try {
    await logout()
    await router.replace('/login')
  } catch {
    // Se conserva la sesión y se muestra el error para poder reintentar.
  }
}
const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const cantidadFavoritos = computed(() => actividadesStore.favoritosIds.length)
const usuario = computed(() => authStore.usuario)
const esAdministrador = computed(() => authStore.isAdmin)
</script>

<template>
  <div class="app-layout">
    <!-- Oculta cabecera en vistas de login/registro -->
    <header v-if="!route.meta.acceso" class="app-header cabecera">
      <div class="header-contenedor">
        <RouterLink to="/actividades" class="logo-link">
          <img
            :src="logoBlanco"
            alt="GoPlan"
            class="logo-imagen"
          />
        </RouterLink>

        <nav class="nav-links" aria-label="Navegación principal">
          <RouterLink to="/actividades">Actividades</RouterLink>
          <RouterLink to="/favoritos" class="link-favoritos">
            Favoritos
            <span v-if="cantidadFavoritos > 0" class="badge-fav">{{ cantidadFavoritos }}</span>
          </RouterLink>
          <RouterLink to="/mis-reservas">Mis reservas</RouterLink>
          <RouterLink to="/perfil">Mi perfil</RouterLink>

          <RouterLink v-if="esAdministrador" to="/admin/actividades">
          Administrar actividades
          </RouterLink>

          <!-- Acceso / Cuenta según estado de sesión -->
          <RouterLink v-if="!usuario" to="/login" class="link-acceso"> Iniciar sesión </RouterLink>
          <template v-else>
            <span class="usuario-logueado">Hola, {{ usuario.nombre || usuario.email }}</span>
            <button
              class="boton-salir"
              type="button"
              :disabled="cerrandoSesion"
              @click="cerrarSesion"
            >
              {{ cerrandoSesion ? 'Cerrando sesión…' : 'Cerrar sesión' }}
            </button>
          </template>
        </nav>
      </div>
      <p v-if="errorSesion" class="error-sesion" role="alert">{{ errorSesion }}</p>
    </header>

    <main class="app-contenido" :class="{ 'pagina-completa': route.meta.acceso }">
      <RouterView />
    </main>

    <footer v-if="!route.meta.acceso" class="app-footer">
      <p>© 2026 GoPlan — Trabajo Práctico Integrador PNT2 (Grupo 1)</p>
    </footer>

    <!-- Notificación Toast flotante -->
    <Transition name="toast">
      <div
        v-if="actividadesStore.notificacionVisible"
        class="toast-notificacion"
        role="status"
        aria-live="polite"
      >
        <span class="toast-icono" aria-hidden="true">❤️</span>
        <span>{{ actividadesStore.mensajeNotificacion }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.boton-salir {
  padding: 0.5rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
}
.boton-salir:hover {
  background: rgba(255, 255, 255, 0.25);
}
.boton-salir:focus-visible {
  outline: 3px solid #fc7e22;
  outline-offset: 3px;
}
.boton-salir:disabled {
  opacity: 0.6;
  cursor: wait;
}
.error-sesion {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 0.85rem;
  color: #a42c2c;
}
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.toast-notificacion {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #4b5461;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;
  pointer-events: none;
}

.toast-icono {
  font-size: 1.15rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.35s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #025e47;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.header-contenedor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.logo-imagen {
  height: 58px;
  width: auto;
  object-fit: contain;
  display: block;
  transition: transform 0.2s ease;
}

.logo-imagen:hover {
  transform: scale(1.03);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-links a {
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  color: #e2e8f0;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.nav-links a:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.nav-links a.router-link-active {
  color: #ffffff;
  background: #fc7e22;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(252, 126, 34, 0.35);
}

.link-acceso {
  background: #fc7e22 !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}

.link-acceso:hover {
  background: #ea6c13 !important;
}

.usuario-logueado {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-fav {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 9999px;
  line-height: 1;
}

.app-contenido {
  flex-grow: 1;
}

.pagina-completa {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.app-footer {
  border-top: 1px solid var(--color-border, #e2e8f0);
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  background: var(--color-background-soft, #f8fafc);
}
</style>
