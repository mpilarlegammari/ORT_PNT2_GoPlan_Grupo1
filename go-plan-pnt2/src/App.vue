<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <header v-if="!route.meta.acceso" class="cabecera">
    <RouterLink class="marca" to="/">GO PLAN</RouterLink>
    <nav aria-label="Navegación principal">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/login">Mi cuenta</RouterLink>
    </nav>
  </header>
  <main :class="{ 'pagina-completa': route.meta.acceso }"><RouterView /></main>
</template>

<style scoped>
.pagina-completa {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
:global(#app:has(.pagina-completa)) {
  padding-bottom: 0;
}
.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}
.marca {
  font-weight: 800;
  letter-spacing: 0.12em;
}
nav {
  display: flex;
  gap: 1rem;
}
nav a.router-link-exact-active {
  text-decoration: underline;
  text-underline-offset: 5px;
}
</style>
