<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'

const store = useActividadesStore()

const destacada = computed(() => {
  return store.actividadesDestacadas[0] || null
})

const esFav = computed(() => (destacada.value ? store.esFavorito(destacada.value.id) : false))

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'full',
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
  if (!Number.isFinite(ms)) return 'Próximamente'
  return formatoFecha.format(ms)
}

function toggleFav() {
  if (destacada.value) {
    store.toggleFavorito(destacada.value.id)
  }
}
</script>

<template>
  <section v-if="destacada" class="banner-destacada" aria-label="Actividad destacada">
    <div class="banner-contenedor">
      <div class="banner-imagen-col">
        <img :src="destacada.imagen" :alt="destacada.nombre" class="banner-imagen" />
        <span class="ribbon-destacado">Destacado</span>
      </div>

      <div class="banner-info-col">
        <div class="banner-tags">
          <span class="tag-categoria">{{ destacada.categoria }}</span>
          <span class="tag-fecha">{{ formatearFecha(destacada.fecha) }}</span>
        </div>

        <h2 class="banner-titulo">{{ destacada.nombre }}</h2>
        <p class="banner-descripcion">{{ destacada.descripcion }}</p>

        <div class="banner-ubicacion">
          <svg class="icono-mapa" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
          <span>{{ destacada.direccion }}, {{ destacada.ciudad }}</span>
        </div>

        <div class="banner-acciones">
          <div class="banner-precio-box">
            <span class="banner-precio-lbl">Entradas desde</span>
            <span class="banner-precio-val">{{ formatoMoneda.format(destacada.precio) }}</span>
            <span class="banner-cupos">{{ destacada.cupo }} lugares disponibles</span>
          </div>

          <div class="banner-botones">
            <button
              type="button"
              class="btn-fav-banner"
              :class="{ activo: esFav }"
              :title="esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'"
              @click="toggleFav"
            >
              <svg viewBox="0 0 24 24" class="icono-corazon" aria-hidden="true">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>

            <RouterLink
              :to="{ name: 'actividad-detalle', params: { id: destacada.id } }"
              class="btn-ver-destacada"
            >
              Ver actividad
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.banner-destacada {
  margin-bottom: 2.5rem;
}

.banner-contenedor {
  display: grid;
  grid-template-columns: 1fr;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.25);
}

@media (min-width: 768px) {
  .banner-contenedor {
    grid-template-columns: 1.2fr 1fr;
  }
}

.banner-imagen-col {
  position: relative;
  min-height: 250px;
}

.banner-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ribbon-destacado {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #f59e0b;
  color: #000;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 9999px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.banner-info-col {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.85rem;
}

@media (min-width: 1024px) {
  .banner-info-col {
    padding: 2.5rem;
  }
}

.banner-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.tag-categoria {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  color: #93c5fd;
}

.tag-fecha {
  color: #cbd5e1;
  padding: 4px 0;
}

.banner-titulo {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  color: #ffffff;
}

@media (min-width: 768px) {
  .banner-titulo {
    font-size: 2.1rem;
  }
}

.banner-descripcion {
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
}

.banner-ubicacion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.icono-mapa {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.banner-acciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.banner-precio-box {
  display: flex;
  flex-direction: column;
}

.banner-precio-lbl {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.banner-precio-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: #38bdf8;
}

.banner-cupos {
  font-size: 0.8rem;
  color: #4ade80;
}

.banner-botones {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-fav-banner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-fav-banner:hover {
  background: rgba(255, 255, 255, 0.15);
}

.icono-corazon {
  width: 22px;
  height: 22px;
  fill: #cbd5e1;
  transition: fill 0.2s ease;
}

.btn-fav-banner.activo .icono-corazon {
  fill: #ef4444;
}

.btn-ver-destacada {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s ease, transform 0.15s ease;
}

.btn-ver-destacada:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}
</style>
