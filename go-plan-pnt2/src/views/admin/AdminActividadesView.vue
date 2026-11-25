<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { eliminarActividadAPI, obtenerActividadesAPI } from '@/services/actividades'

const actividades = ref([])
const cargando = ref(false)
const error = ref('')
const errorEliminacion = ref('')
const eliminandoId = ref(null)

async function cargarActividades() {
  cargando.value = true
  error.value = ''

  try {
    actividades.value = await obtenerActividadesAPI()
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar las actividades.'
  } finally {
    cargando.value = false
  }
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Date(fecha).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

async function eliminarActividad(actividad) {
  const confirmado = window.confirm(
    `La actividad «${actividad.nombre}» se eliminará y sus reservas confirmadas serán canceladas. Esta acción no se puede deshacer. ¿Querés continuar?`,
  )
  if (!confirmado || eliminandoId.value !== null) return

  eliminandoId.value = actividad.id
  errorEliminacion.value = ''
  try {
    await eliminarActividadAPI(actividad.id)
    actividades.value = actividades.value.filter((item) => item.id !== actividad.id)
  } catch (err) {
    errorEliminacion.value = err.message || 'No se pudo eliminar la actividad.'
  } finally {
    eliminandoId.value = null
  }
}

onMounted(cargarActividades)
</script>

<template>
  <main class="admin-actividades">
    
<header class="encabezado">
  <div>
    <h1>Administrar actividades</h1>
    <p>Consultá y gestioná las actividades de GoPlan.</p>
  </div>

  <div class="acciones-encabezado">
    <RouterLink :to="{ name: 'actividad-crear' }" class="boton-crear">
      Crear actividad
    </RouterLink>

    <RouterLink to="/actividades" class="boton-secundario">
      Volver al catálogo
    </RouterLink>
  </div>
</header>


    <div class="resumen">
      <article class="tarjeta">
        <span>Total de actividades</span>
        <strong>{{ actividades.length }}</strong>
      </article>

      <article class="tarjeta">
        <span>Activas</span>
        <strong>{{ actividades.filter(a => a.activa).length }}</strong>
      </article>

      <article class="tarjeta">
        <span>Inactivas</span>
        <strong>{{ actividades.filter(a => !a.activa).length }}</strong>
      </article>
    </div>

    <p v-if="errorEliminacion" class="error" role="alert">{{ errorEliminacion }}</p>

    <p v-if="cargando" class="mensaje">Cargando actividades...</p>

    <div v-else-if="error" class="error" role="alert">
      {{ error }}
      <button @click="cargarActividades">Reintentar</button>
    </div>

    
<section v-else class="listado">
  <p v-if="actividades.length === 0" class="mensaje">
    Todavía no hay actividades registradas.
  </p>

  <div v-else class="tabla-contenedor">
    <table class="tabla-actividades">
      <thead>
        <tr>
          <th>Actividad</th>
          <th>Categoría</th>
          <th>Ciudad</th>
          <th>Fecha</th>
          <th>Cupo</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="actividad in actividades" :key="actividad.id">
          <td class="nombre-actividad">{{ actividad.nombre }}</td>
          <td>{{ actividad.categoria }}</td>
          <td>{{ actividad.ciudad }}</td>
          <td>{{ formatearFecha(actividad.fecha) }}</td>
          <td>{{ actividad.cupo }}</td>
          <td>${{ actividad.precio }}</td>

          <td>
            <span :class="actividad.activa ? 'estado-activo' : 'estado-inactivo'">
              {{ actividad.activa ? 'Activa' : 'Inactiva' }}
            </span>
          </td>

          <td>
            <RouterLink
              :to="{ name: 'actividad-editar', params: { id: actividad.id } }"
              class="boton-editar"
            >
              Editar
            </RouterLink>
            <button
              type="button"
              class="boton-eliminar"
              :disabled="eliminandoId !== null"
              @click="eliminarActividad(actividad)"
            >
              {{ eliminandoId === actividad.id ? 'Eliminando…' : 'Eliminar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

  </main>
</template>

<style scoped>
.admin-actividades {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 20px 14px;
  box-sizing: border-box;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.encabezado h1 {
  margin-bottom: 8px;
}

.encabezado p,
.informacion p {
  color: #64748b;
}


.resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.tarjeta {
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.tarjeta span,
.tarjeta strong {
  display: block;
}

.tarjeta span {
  color: #64748b;
  font-size: 14px;
}

.tarjeta strong {
  margin-top: 5px;
  font-size: 22px;
  font-weight: 500;
}


.tarjeta span,
.tarjeta strong {
  display: block;
}

.tarjeta strong {
  margin-top: 10px;
  font-size: 26px;
}

.actividad {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.informacion h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.informacion p {
  margin: 5px 0;
}

.acciones {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.tabla-actividades {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla-actividades th,
.tabla-actividades td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.tabla-actividades th {
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
}

.tabla-actividades td {
  color: #475569;
  font-size: 14px;
}

.tabla-actividades tbody tr:last-child td {
  border-bottom: none;
}

.tabla-actividades tbody tr:hover {
  background: #f8fafc;
}

.tabla-actividades .nombre-actividad {
  color: #1e293b;
  font-weight: 500;
}


.estado-activo,
.estado-inactivo {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
}

.estado-activo {
  color: #166534;
  background: #dcfce7;
}

.estado-inactivo {
  color: #991b1b;
  background: #fee2e2;
}

.boton-editar {
  display: inline-block;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #334155;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.boton-editar:hover {
  background: #f1f5f9;
}

.boton-eliminar {
  display: inline-block;
  margin-left: 8px;
  padding: 8px 14px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff;
  color: #b91c1c;
  font: inherit;
  font-size: 14px;
}

.boton-eliminar:hover:not(:disabled) {
  background: #fef2f2;
}

.boton-eliminar:disabled {
  cursor: wait;
  opacity: 0.65;
}

.boton-secundario {
  padding: 9px 14px;
  border-radius: 8px;
  background: #475569;
  color: white;
  text-decoration: none;
}

.boton-secundario {
  background: #475569;
}

.acciones-encabezado {
  display: flex;
  align-items: center;
  gap: 12px;
}

.boton-crear {
  padding: 9px 14px;
  border-radius: 8px;
  background: #16a34a;
  color: white;
  text-decoration: none;
}

.mensaje {
  padding: 20px;
  color: #64748b;
}

.error {
  padding: 16px;
  color: #b91c1c;
}

button {
  cursor: pointer;
  margin-left: 10px;
}

@media (max-width: 650px) {
  .encabezado,
  .actividad,
  .acciones-encabezado {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
