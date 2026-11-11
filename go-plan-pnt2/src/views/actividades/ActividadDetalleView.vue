<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'

const route = useRoute()
const store = useActividadesStore()

const actividad = computed(() => store.obtenerActividadPorId(route.params.id))
const esFav = computed(() => (actividad.value ? store.esFavorito(actividad.value.id) : false))
</script>

<template>
  <main class="detalle-vista">
    <nav class="breadcrumb">
      <RouterLink to="/actividades">← Volver al catálogo</RouterLink>
    </nav>

    <div v-if="actividad" class="detalle-contenido">
      <h1>{{ actividad.nombre }}</h1>
      <p class="categoria-tag">{{ actividad.categoria }}</p>
      <img :src="actividad.imagen" :alt="actividad.nombre" class="detalle-img" />
      <p class="descripcion">{{ actividad.descripcion }}</p>
      <div class="info-extra">
        <p><strong>Ubicación:</strong> {{ actividad.direccion }}, {{ actividad.ciudad }}</p>
        <p><strong>Cupo:</strong> {{ actividad.cupo }} personas</p>
        <p><strong>Precio:</strong> $ {{ actividad.precio }}</p>
      </div>
      <button type="button" @click="store.toggleFavorito(actividad.id)">
        {{ esFav ? '❤️ Quitar de favoritos' : '🤍 Guardar en favoritos' }}
      </button>
    </div>

    <div v-else class="no-encontrada">
      <h2>Actividad no encontrada</h2>
      <RouterLink to="/actividades">Volver al catálogo</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.detalle-vista {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
.breadcrumb a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}
.detalle-img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin: 1rem 0;
}
</style>
