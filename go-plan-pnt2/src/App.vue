<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'
import useAuthStore from '@/stores/authStore'

const route = useRoute()
const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const cantidadFavoritos = computed(() => actividadesStore.favoritosIds.length)
const usuario = computed(() => authStore.usuario)
</script>

<template>
  <div class="app-layout">
    <!-- Oculta cabecera en vistas de login/registro -->
    <header v-if="!route.meta.acceso" class="app-header cabecera">
      <div class="header-contenedor">
        <RouterLink to="/" class="logo-link">
          <span class="logo-marca">GoPlan</span>
          <span class="logo-punto">.</span>
        </RouterLink>

        <nav class="nav-links" aria-label="Navegación principal">
          <RouterLink to="/actividades">Actividades</RouterLink>
          <RouterLink to="/favoritos" class="link-favoritos">
            Favoritos
            <span v-if="cantidadFavoritos > 0" class="badge-fav">{{ cantidadFavoritos }}</span>
          </RouterLink>
          <RouterLink to="/mis-reservas">Mis reservas</RouterLink>
          <RouterLink to="/perfil">Mi perfil</RouterLink>

          <!-- Acceso / Cuenta según estado de sesión -->
          <RouterLink v-if="!usuario" to="/login" class="link-acceso">
            Iniciar sesión
          </RouterLink>
          <span v-else class="usuario-logueado">
            Hola, {{ usuario.nombre || usuario.email }}
          </span>
        </nav>
      </div>
    </header>

    <main class="app-contenido" :class="{ 'pagina-completa': route.meta.acceso }">
      <RouterView />
    </main>

    <footer v-if="!route.meta.acceso" class="app-footer">
      <p>© 2026 GoPlan — Trabajo Práctico Integrador PNT2 (Grupo 1)</p>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-background, #ffffff);
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.logo-punto {
  color: #2563eb;
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
  color: #475569;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.nav-links a:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.nav-links a.router-link-active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
}

.link-acceso {
  background: #2563eb !important;
  color: #ffffff !important;
  font-weight: 600 !important;
}

.link-acceso:hover {
  background: #1d4ed8 !important;
}

.usuario-logueado {
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-radius: 8px;
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
