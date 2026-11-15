<script setup>
import EditarActividadButton from '@/components/actividades/EditarActividadButton.vue'
import { computed, ref, watch } from 'vue'
import { obtenerActividadPorIdAPI } from '@/services/actividades'
import { useRoute, RouterLink } from 'vue-router'
import { useActividadesStore } from '@/stores/actividades'
import { crearReserva } from '@/services/reservasApi.js'

const route = useRoute()
const store = useActividadesStore()

const actividad = ref(null)
const cargando = ref(false)
const error = ref('')
const reservando = ref(false)
const reservaConfirmada = ref(false)
const errorReserva = ref('')
const avisoDisponibilidad = ref('')
let solicitud = 0

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatoFechaLarga = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})

function formatearFecha(fechaStr) {
  const ms = Date.parse(fechaStr)
  if (!Number.isFinite(ms)) return 'Fecha a coordinar'
  return formatoFechaLarga.format(ms)
}

function formatearPrecio(val) {
  if (typeof val !== 'number') return '$ 0'
  return formatoMoneda.format(val)
}

async function cargarActividad(id) {
  const actual = ++solicitud
  cargando.value = true
  error.value = ''
  reservando.value = false
  reservaConfirmada.value = false
  errorReserva.value = ''
  avisoDisponibilidad.value = ''
  actividad.value = null
  try {
    const datos = await obtenerActividadPorIdAPI(id)
    if (actual === solicitud) actividad.value = datos
  } catch (err) {
    if (actual === solicitud) error.value = err.message
  } finally {
    if (actual === solicitud) cargando.value = false
  }
}

watch(() => route.params.id, cargarActividad, { immediate: true })

const esFav = computed(() => (actividad.value ? store.esFavorito(actividad.value.id) : false))
const disponibles = computed(() => {
  if (!actividad.value) return 0
  return Math.max(0, actividad.value.cupo - (actividad.value.cuposReservados ?? 0))
})

const porcentajeOcupacion = computed(() => {
  if (!actividad.value || !actividad.value.cupo) return 0
  const reservados = actividad.value.cuposReservados ?? 0
  return Math.min(100, Math.round((reservados / actividad.value.cupo) * 100))
})

async function reservar() {
  if (reservando.value || reservaConfirmada.value || !actividad.value || disponibles.value === 0) return
  const actual = solicitud
  const id = actividad.value.id
  reservando.value = true
  errorReserva.value = ''
  avisoDisponibilidad.value = ''
  try {
    await crearReserva(id)
    if (actual === solicitud) reservaConfirmada.value = true
  } catch (err) {
    if (actual === solicitud) {
      errorReserva.value = err.status === 401 ? 'Iniciá sesión para reservar.' : err.message
    }
  }
  try {
    if (actual !== solicitud) return
    const actualizada = await obtenerActividadPorIdAPI(id)
    if (actual === solicitud && actualizada) {
      actividad.value = actualizada
      store.actualizarActividad(id, actualizada)
    }
  } catch {
    if (actual === solicitud) avisoDisponibilidad.value = 'No pudimos actualizar la disponibilidad.'
  } finally {
    if (actual === solicitud) reservando.value = false
  }
}
</script>

<template>
  <main class="detalle-vista">
    <!-- Breadcrumb superior -->
    <nav class="breadcrumb" aria-label="Navegación secundaria">
      <RouterLink to="/actividades" class="link-volver">
        <svg viewBox="0 0 24 24" class="icono-flecha" aria-hidden="true">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Volver al catálogo
      </RouterLink>
    </nav>

    <!-- Estado de carga -->
    <div v-if="cargando" class="estado-cargando" role="status">
      <div class="spinner"></div>
      <p>Cargando información de la actividad…</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="estado-error" role="alert">
      <h2>Ocurrió un error</h2>
      <p>{{ error }}</p>
      <button type="button" class="btn-reintentar" @click="cargarActividad(route.params.id)">
        Reintentar
      </button>
    </div>

    <!-- Contenido principal cuando la actividad está cargada -->
    <article v-else-if="actividad" class="detalle-contenido">
      <!-- Encabezado de la actividad -->
      <header class="detalle-header">
        <div class="header-tags">
          <span class="badge-categoria">{{ actividad.categoria }}</span>
          <span class="badge-fecha">{{ formatearFecha(actividad.fecha) }}</span>
        </div>

        <div class="titulo-con-admin">
          <h1 class="detalle-titulo">{{ actividad.nombre }}</h1>
          <EditarActividadButton :id="actividad.id" />
        </div>

        <p class="ubicacion-cabecera">
          <svg viewBox="0 0 24 24" class="icono-ubicacion" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
          {{ actividad.direccion }}, {{ actividad.ciudad }}, {{ actividad.provincia }}, {{ actividad.pais }}
        </p>
      </header>

      <!-- Portada Visual en Alta Resolución -->
      <div class="detalle-portada-box">
        <img
          :src="actividad.imagen || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'"
          :alt="actividad.nombre"
          class="detalle-portada-img"
        />
        <button
          type="button"
          class="btn-favorito-hero"
          :class="{ activo: esFav }"
          :title="esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'"
          :aria-label="esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'"
          @click="store.toggleFavorito(actividad.id)"
        >
          <svg viewBox="0 0 24 24" class="icono-corazon" aria-hidden="true">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          <span class="fav-texto">{{ esFav ? 'Guardado en favoritos' : 'Guardar en favoritos' }}</span>
        </button>
      </div>

      <!-- Layout en 2 Columnas -->
      <div class="detalle-grid">
        <!-- Columna Izquierda: Información de la Actividad -->
        <div class="columna-info">
          <!-- Descripción principal -->
          <section class="seccion-bloque">
            <h2>Acerca de esta experiencia</h2>
            <p class="descripcion-texto">{{ actividad.descripcion }}</p>
          </section>

          <!-- Ficha de aspectos destacados -->
          <section class="seccion-bloque">
            <h2>Detalles destacados</h2>
            <div class="grid-caracteristicas">
              <div class="card-item-caracteristica">
                <span class="icono-caract">⏱️</span>
                <div>
                  <strong>Duración estimada</strong>
                  <p>2 horas y media de actividad</p>
                </div>
              </div>

              <div class="card-item-caracteristica">
                <span class="icono-caract">👥</span>
                <div>
                  <strong>Modalidad</strong>
                  <p>Grupo reducido presencial</p>
                </div>
              </div>

              <div class="card-item-caracteristica">
                <span class="icono-caract">🎒</span>
                <div>
                  <strong>Materiales</strong>
                  <p>Insumos y herramientas incluidos</p>
                </div>
              </div>

              <div class="card-item-caracteristica">
                <span class="icono-caract">🎓</span>
                <div>
                  <strong>Nivel</strong>
                  <p>Apto para principiantes y entusiastas</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Ubicación y Encuentro -->
          <section class="seccion-bloque">
            <h2>Punto de encuentro</h2>
            <div class="card-ubicacion">
              <div class="ubicacion-detalles">
                <p class="direccion-principal">{{ actividad.direccion }}</p>
                <p class="ciudad-provincia">{{ actividad.ciudad }}, {{ actividad.provincia }} ({{ actividad.pais }})</p>
              </div>
              <a
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(actividad.direccion + ' ' + actividad.ciudad)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-mapa"
              >
                Abrir en Google Maps ↗
              </a>
            </div>
          </section>

          <!-- Política de Cancelación -->
          <section class="seccion-bloque">
            <h2>Políticas y Requisitos</h2>
            <div class="caja-aviso-cancelacion">
              <strong>Cancelación flexible</strong>
              <p>Podés cancelar tu reserva hasta con 12 horas de anticipación a la fecha del evento y recibir el reintegro de tus puntos o saldo.</p>
            </div>
          </section>
        </div>

        <!-- Columna Derecha: Tarjeta Sticky de Reserva -->
        <aside class="columna-reserva">
          <div class="caja-reserva-sticky">
            <div class="precio-encabezado">
              <span class="etiqueta-precio">Precio por persona</span>
              <span class="valor-precio">{{ formatearPrecio(actividad.precio) }}</span>
            </div>

            <!-- Semáforo de disponibilidad y cupos -->
            <div class="disponibilidad-box">
              <div class="cupos-texto">
                <p v-if="disponibles === 0" class="texto-sin-cupos">
                  <strong>Sin cupos</strong>
                </p>
                <p v-else class="texto-con-cupos">
                  <strong>Cupos disponibles:</strong> {{ disponibles }}
                </p>
                <span class="total-cupos">de {{ actividad.cupo }} lugares</span>
              </div>

              <div class="barra-progreso-wrapper">
                <div
                  class="barra-progreso"
                  :class="{ llena: disponibles === 0, limite: disponibles > 0 && disponibles <= 3 }"
                  :style="{ width: `${porcentajeOcupacion}%` }"
                ></div>
              </div>
            </div>

            <!-- Botón de Reserva principal -->
            <div class="acciones-reserva">
              <button
                v-if="!reservaConfirmada"
                type="button"
                class="btn-reservar-principal"
                :disabled="reservando || disponibles === 0"
                @click="reservar"
              >
                {{ reservando ? 'Reservando…' : 'Reservar' }}
              </button>

              <!-- Mensaje de confirmación cuando se reservó -->
              <div v-else class="alerta-confirmada" role="status">
                <span class="icono-check">✓</span>
                <p>
                  Tu reserva está confirmada.
                  <RouterLink to="/mis-reservas" class="link-mis-reservas">Ver Mis Reservas</RouterLink>
                </p>
              </div>

              <!-- Errores y Avisos -->
              <p v-if="errorReserva" class="alerta-error" role="alert">{{ errorReserva }}</p>
              <p v-if="avisoDisponibilidad" class="alerta-aviso" role="status">{{ avisoDisponibilidad }}</p>
            </div>

            <!-- Resumen de beneficios -->
            <ul class="beneficios-reserva">
              <li>✓ Confirmación inmediata</li>
              <li>✓ Cancelación hasta 12 hs antes</li>
              <li>✓ Cupo 100% asegurado</li>
            </ul>
          </div>
        </aside>
      </div>
    </article>

    <!-- Estado si no existe la actividad -->
    <div v-else class="no-encontrada" role="alert">
      <h2>Actividad no encontrada</h2>
      <p>No pudimos encontrar la experiencia que estás buscando.</p>
      <RouterLink to="/actividades" class="btn-volver-catalogo">Volver al catálogo</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.detalle-vista {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 5rem;
}

.breadcrumb {
  margin-bottom: 1.5rem;
}

.link-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.link-volver:hover {
  color: #1d4ed8;
}

.icono-flecha {
  width: 18px;
  height: 18px;
}

/* Encabezado */
.detalle-header {
  margin-bottom: 1.5rem;
}

.header-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.badge-categoria {
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-fecha {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.titulo-con-admin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.detalle-titulo {
  font-size: 2.2rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.5px;
}

@media (min-width: 768px) {
  .detalle-titulo {
    font-size: 2.6rem;
  }
}

.ubicacion-cabecera {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.icono-ubicacion {
  width: 18px;
  height: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

/* Portada */
.detalle-portada-box {
  position: relative;
  width: 100%;
  aspect-ratio: 21 / 9;
  min-height: 280px;
  max-height: 480px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2.5rem;
  background-color: #f1f5f9;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.detalle-portada-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.btn-favorito-hero {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  padding: 8px 16px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  font-size: 0.85rem;
  color: #334155;
  transition: all 0.2s ease;
}

.btn-favorito-hero:hover {
  transform: translateY(-2px);
  background: #ffffff;
}

.btn-favorito-hero .icono-corazon {
  width: 18px;
  height: 18px;
  fill: #94a3b8;
  transition: fill 0.2s ease;
}

.btn-favorito-hero.activo .icono-corazon {
  fill: #ef4444;
}

.btn-favorito-hero.activo {
  color: #ef4444;
}

/* Layout en dos columnas */
.detalle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

@media (min-width: 1024px) {
  .detalle-grid {
    grid-template-columns: 1fr 380px;
    align-items: start;
  }
}

.seccion-bloque {
  margin-bottom: 2.5rem;
}

.seccion-bloque h2 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.descripcion-texto {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #334155;
  margin: 0;
}

/* Tarjetas de características */
.grid-caracteristicas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.card-item-caracteristica {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem;
  background: var(--color-background-soft, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
}

.icono-caract {
  font-size: 1.6rem;
  line-height: 1;
}

.card-item-caracteristica strong {
  display: block;
  font-size: 0.95rem;
  color: #0f172a;
  margin-bottom: 0.2rem;
}

.card-item-caracteristica p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

/* Ubicación */
.card-ubicacion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-background-soft, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
}

.direccion-principal {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.ciudad-provincia {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.btn-mapa {
  padding: 0.6rem 1.2rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-mapa:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

/* Aviso de cancelación */
.caja-aviso-cancelacion {
  padding: 1.25rem;
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  border-radius: 8px;
}

.caja-aviso-cancelacion strong {
  display: block;
  color: #166534;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.caja-aviso-cancelacion p {
  margin: 0;
  font-size: 0.9rem;
  color: #15803d;
  line-height: 1.5;
}

/* Columna Lateral Sticky de Reserva */
.caja-reserva-sticky {
  position: sticky;
  top: 90px;
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.precio-encabezado {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  padding-bottom: 1rem;
}

.etiqueta-precio {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.valor-precio {
  font-size: 2rem;
  font-weight: 900;
  color: #0f172a;
}

.disponibilidad-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cupos-texto {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.95rem;
}

.texto-sin-cupos {
  color: #ef4444;
  margin: 0;
}

.texto-con-cupos {
  color: #16a34a;
  margin: 0;
}

.total-cupos {
  font-size: 0.8rem;
  color: #94a3b8;
}

.barra-progreso-wrapper {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.barra-progreso {
  height: 100%;
  background: #22c55e;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.barra-progreso.limite {
  background: #f59e0b;
}

.barra-progreso.llena {
  background: #ef4444;
}

.acciones-reserva {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-reservar-principal {
  width: 100%;
  padding: 0.9rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reservar-principal:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-reservar-principal:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.alerta-confirmada {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #ecfdf5;
  border: 1px solid #10b981;
  padding: 1rem;
  border-radius: 10px;
  color: #065f46;
  font-size: 0.95rem;
}

.icono-check {
  font-weight: 900;
  font-size: 1.2rem;
  color: #10b981;
}

.link-mis-reservas {
  color: #047857;
  font-weight: 700;
  text-decoration: underline;
  display: block;
  margin-top: 0.25rem;
}

.alerta-error {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  background: #fef2f2;
  padding: 0.6rem;
  border-radius: 6px;
  margin: 0;
}

.alerta-aviso {
  color: #d97706;
  font-size: 0.85rem;
  background: #fffbeb;
  padding: 0.6rem;
  border-radius: 6px;
  margin: 0;
}

.beneficios-reserva {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  border-top: 1px solid var(--color-border, #e2e8f0);
  padding-top: 1rem;
}

/* Estados Vacíos y de Error */
.estado-cargando,
.estado-error,
.no-encontrada {
  text-align: center;
  padding: 5rem 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.btn-reintentar,
.btn-volver-catalogo {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
</style>
