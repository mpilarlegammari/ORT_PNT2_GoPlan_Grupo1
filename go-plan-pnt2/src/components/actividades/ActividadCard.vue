<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'

const props = defineProps({
  actividad: {
    type: Object,
    required: true,
  },
})

const store = useActividadesStore()

const esFav = computed(() => store.esFavorito(props.actividad.id))

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function formatearFecha(fechaStr) {
  const ms = Date.parse(fechaStr)
  if (!Number.isFinite(ms)) return 'Fecha a confirmar'
  return formatoFecha.format(ms)
}

function formatearPrecio(valor) {
  if (typeof valor !== 'number') return '$ 0'
  return formatoMoneda.format(valor)
}

function toggleFav(e) {
  e.preventDefault()
  e.stopPropagation()
  store.toggleFavorito(props.actividad.id)
}
</script>

<template>
  <article class="actividad-card">
    <div class="card-imagen-wrapper">
      <img
        :src="actividad.imagen || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'"
        :alt="actividad.nombre"
        class="card-imagen"
        loading="lazy"
      />
      <span class="badge-categoria">{{ actividad.categoria }}</span>

      <button
        type="button"
        class="btn-favorito"
        :class="{ activo: esFav }"
        :title="esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'"
        :aria-label="esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'"
        @click="toggleFav"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="icono-corazon"
          aria-hidden="true"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </button>
    </div>

    <div class="card-cuerpo">
      <div class="card-meta">
        <span class="fecha">
          <svg class="icono-mini" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
          </svg>
          {{ formatearFecha(actividad.fecha) }}
        </span>
        <span class="ubicacion">
          <svg class="icono-mini" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {{ actividad.ciudad }}, {{ actividad.provincia }}
        </span>
      </div>

      <h3 class="card-titulo">
        <RouterLink :to="{ name: 'actividad-detalle', params: { id: actividad.id } }">
          {{ actividad.nombre }}
        </RouterLink>
      </h3>

      <p class="card-descripcion">
        {{ actividad.descripcion }}
      </p>

      <div class="card-pie">
        <div class="precio-cupo">
          <span class="precio-label">Precio</span>
          <span class="precio-valor">{{ formatearPrecio(actividad.precio) }}</span>
          <span class="cupo-disponible">{{ actividad.cupo }} lugares disp.</span>
        </div>

        <RouterLink
          :to="{ name: 'actividad-detalle', params: { id: actividad.id } }"
          class="btn-detalle"
        >
          Ver detalle
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.actividad-card {
  display: flex;
  flex-direction: column;
  background: var(--color-background-soft, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  height: 100%;
}

.actividad-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
}

.card-imagen-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #f1f5f9;
  overflow: hidden;
}

.card-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.actividad-card:hover .card-imagen {
  transform: scale(1.04);
}

.badge-categoria {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-favorito {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background 0.2s ease, transform 0.15s ease;
}

.btn-favorito:hover {
  transform: scale(1.1);
  background: #ffffff;
}

.icono-corazon {
  width: 20px;
  height: 20px;
  fill: #94a3b8;
  transition: fill 0.2s ease, transform 0.2s ease;
}

.btn-favorito.activo .icono-corazon {
  fill: #ef4444;
  animation: pulso 0.3s ease;
}

@keyframes pulso {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.card-cuerpo {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem;
  gap: 0.6rem;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #64748b;
}

.fecha, .ubicacion {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.icono-mini {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.card-titulo {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}

.card-titulo a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.card-titulo a:hover {
  color: #2563eb;
}

.card-descripcion {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text, #475569);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.card-pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border, #e2e8f0);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.precio-cupo {
  display: flex;
  flex-direction: column;
}

.precio-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}

.precio-valor {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.cupo-disponible {
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 600;
}

.btn-detalle {
  padding: 0.55rem 1rem;
  background: #2563eb;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: background 0.2s ease;
  white-space: nowrap;
}

.btn-detalle:hover {
  background: #1d4ed8;
}
</style>
