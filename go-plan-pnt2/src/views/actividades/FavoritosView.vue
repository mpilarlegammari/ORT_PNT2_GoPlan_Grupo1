<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'
import ActividadCard from '@/components/actividades/ActividadCard.vue'

const store = useActividadesStore()
const favoritos = computed(() => store.listaFavoritos)
onMounted(() => store.cargarActividades())
</script>

<template>
  <main class="favoritos-vista">
    <header class="favoritos-encabezado">
      <nav class="breadcrumb">
        <RouterLink to="/actividades">← Volver al catálogo</RouterLink>
      </nav>
      <h1>Mis Actividades Favoritas</h1>
      <p>Tené a mano las experiencias que más te interesan para reservar cuando quieras.</p>
      <div v-if="favoritos.length > 0" class="acciones-favoritos">
        <button type="button" class="btn-vaciar" @click="store.vaciarFavoritos">
          Vaciar lista de favoritos
        </button>
      </div>
    </header>

    <p v-if="store.cargando" role="status">Cargando favoritos…</p>
    <div v-else-if="store.error" role="alert">
      <p>{{ store.error }}</p>
      <button type="button" @click="store.cargarActividades">Reintentar</button>
    </div>
    <TransitionGroup
      v-else-if="favoritos.length > 0"
      name="grilla-anim"
      tag="div"
      class="grilla-favoritos"
    >
      <ActividadCard v-for="actividad in favoritos" :key="actividad.id" :actividad="actividad" />
    </TransitionGroup>

    <div v-else class="sin-favoritos">
      <p>Todavía no agregaste actividades a tus favoritos.</p>
      <RouterLink to="/actividades" class="btn-explorar">Explorar catálogo</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.favoritos-vista {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem;
}
.favoritos-encabezado {
  margin-bottom: 2.25rem;
}
.breadcrumb a {
  color: #fc7e22;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 0.5rem;
}
.acciones-favoritos {
  margin-top: 1rem;
}
.btn-vaciar {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-vaciar:hover {
  background: #ef4444;
  color: #ffffff;
}
.grilla-favoritos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.grilla-anim-move,
.grilla-anim-enter-active,
.grilla-anim-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.grilla-anim-enter-from,
.grilla-anim-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
@media (min-width: 640px) {
  .grilla-favoritos {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .grilla-favoritos {
    grid-template-columns: repeat(3, 1fr);
  }
}
.sin-favoritos {
  text-align: center;
  padding: 4rem 1rem;
  background: var(--color-background-soft, #f8fafc);
  border-radius: 12px;
}
.btn-explorar {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.65rem 1.25rem;
  background: #fc7e22;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s ease;
}
.btn-explorar:hover {
  background: #ea6c13;
}
</style>
