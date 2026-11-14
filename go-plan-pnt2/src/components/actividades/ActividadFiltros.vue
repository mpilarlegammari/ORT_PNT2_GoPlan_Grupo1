<script setup>
import { computed } from 'vue'
import { useActividadesStore } from '@/stores/actividades'

const store = useActividadesStore()

const textoBusqueda = computed({
  get: () => store.busquedaTexto,
  set: (val) => store.setBusqueda(val),
})

const categoriaActual = computed(() => store.categoriaSeleccionada)
const categorias = computed(() => store.categorias)
const totalResultados = computed(() => store.actividadesFiltradas.length)

function seleccionarCategoria(cat) {
  store.setCategoria(cat)
}

function limpiarBusqueda() {
  store.setBusqueda('')
}
</script>

<template>
  <section class="filtros-contenedor" aria-label="Filtros y búsqueda de actividades">
    <!-- Barra de búsqueda estilo Ticketek -->
    <div class="buscador-wrapper">
      <div class="buscador-input-group">
        <svg class="icono-lupa" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"
          />
        </svg>
        <input
          id="buscador-actividades"
          v-model="textoBusqueda"
          type="search"
          placeholder="Buscar por actividad, ciudad o descripción..."
          aria-label="Buscar actividades"
          autocomplete="off"
        />
        <button
          v-if="textoBusqueda"
          type="button"
          class="btn-limpiar"
          title="Borrar búsqueda"
          aria-label="Borrar búsqueda"
          @click="limpiarBusqueda"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Chips / Pills de categorías -->
    <div class="categorias-scroll" role="tablist" aria-label="Categorías">
      <button
        v-for="cat in categorias"
        :key="cat"
        type="button"
        class="chip-categoria"
        :class="{ activo: categoriaActual === cat }"
        role="tab"
        :aria-selected="categoriaActual === cat"
        @click="seleccionarCategoria(cat)"
      >
        {{ cat === 'todas' ? 'Todas las categorías' : cat }}
      </button>
    </div>

    <!-- Indicador de resultados -->
    <div class="meta-resultados" role="status">
      <span class="conteo-texto">
        Mostrando <strong>{{ totalResultados }}</strong>
        {{ totalResultados === 1 ? 'actividad disponible' : 'actividades disponibles' }}
      </span>

      <button
        v-if="textoBusqueda || categoriaActual !== 'todas'"
        type="button"
        class="btn-resetear"
        @click="store.reiniciarFiltros"
      >
        Limpiar todos los filtros
      </button>
    </div>
  </section>
</template>

<style scoped>
.filtros-contenedor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.buscador-wrapper {
  width: 100%;
}

.buscador-input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--color-background, #ffffff);
  border: 2px solid var(--color-border, #cbd5e1);
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.buscador-input-group:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.icono-lupa {
  width: 20px;
  height: 20px;
  color: #64748b;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

#buscador-actividades {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font: inherit;
  font-size: 1rem;
  color: var(--color-text, #1e293b);
}

.btn-limpiar {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: color 0.2s ease;
}

.btn-limpiar:hover {
  color: #ef4444;
}

.categorias-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.chip-categoria {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-background-soft, #f8fafc);
  color: var(--color-text, #475569);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.chip-categoria:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.chip-categoria.activo {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.meta-resultados {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
  padding: 0 0.25rem;
}

.btn-resetear {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.btn-resetear:hover {
  color: #1d4ed8;
}
</style>

