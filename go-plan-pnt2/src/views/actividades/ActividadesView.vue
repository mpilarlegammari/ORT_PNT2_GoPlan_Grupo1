<script setup>
import { computed } from 'vue'
import { useActividadesStore } from '@/stores/actividades'
import ActividadCard from '@/components/actividades/ActividadCard.vue'
import ActividadFiltros from '@/components/actividades/ActividadFiltros.vue'
import ActividadDestacada from '@/components/actividades/ActividadDestacada.vue'

const store = useActividadesStore()

const actividades = computed(() => store.actividadesFiltradas)
// El banner destacado solo se muestra si no hay filtros aplicados
const mostrarDestacada = computed(() => {
  return !store.busquedaTexto && store.categoriaSeleccionada === 'todas'
})
</script>

<template>
  <main class="catalogo-vista">
    <!-- Banner Principal estilo Ticketek -->
    <ActividadDestacada v-if="mostrarDestacada" />

    <!-- Barra de búsqueda y filtros de categoría -->
    <header class="catalogo-encabezado">
      <h1 class="titulo-seccion">Catálogo de Actividades</h1>
      <p class="subtitulo-seccion">
        Descubrí talleres, experiencias y eventos exclusivos para reservar.
      </p>
    </header>

    <ActividadFiltros />

    <!-- Grilla de Actividades -->
    <section v-if="actividades.length > 0" class="grilla-actividades" aria-label="Lista de actividades">
      <ActividadCard
        v-for="actividad in actividades"
        :key="actividad.id"
        :actividad="actividad"
      />
    </section>

    <!-- Estado vacío cuando no hay resultados de búsqueda -->
    <section v-else class="estado-vacio" role="alert">
      <div class="icono-vacio">🔍</div>
      <h2>No encontramos actividades</h2>
      <p>
        No hay resultados que coincidan con "{{ store.busquedaTexto }}".
        Probá con otra palabra o cambiá de categoría.
      </p>
      <button type="button" class="btn-restablecer" @click="store.reiniciarFiltros">
        Ver todas las actividades
      </button>
    </section>
  </main>
</template>

<style scoped>
.catalogo-vista {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem;
}

.catalogo-encabezado {
  margin-bottom: 1.5rem;
}

.titulo-seccion {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-heading, #0f172a);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.5px;
}

.subtitulo-seccion {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.grilla-actividades {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .grilla-actividades {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grilla-actividades {
    grid-template-columns: repeat(3, 1fr);
  }
}

.estado-vacio {
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--color-background-soft, #f8fafc);
  border: 1px dashed var(--color-border, #cbd5e1);
  border-radius: 16px;
  margin: 2rem 0;
}

.icono-vacio {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.estado-vacio h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.estado-vacio p {
  color: #64748b;
  max-width: 480px;
  margin: 0 auto 1.5rem;
  line-height: 1.5;
}

.btn-restablecer {
  padding: 0.65rem 1.5rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-restablecer:hover {
  background: #1d4ed8;
}
</style>
