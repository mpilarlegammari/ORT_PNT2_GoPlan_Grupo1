<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerActividadesAPI } from '@/services/actividades'

const actividades = ref([])
const cargando = ref(false)
const error = ref('')

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

    <p v-if="cargando" class="mensaje">Cargando actividades...</p>

    <div v-else-if="error" class="error" role="alert">
      {{ error }}
      <button @click="cargarActividades">Reintentar</button>
    </div>

    <section v-else class="listado">
      <p v-if="actividades.length === 0" class="mensaje">
        Todavía no hay actividades registradas.
      </p>

      <article
        v-for="actividad in actividades"
        :key="actividad.id"
        class="actividad"
      >
        <div class="informacion">
          <h2>{{ actividad.nombre }}</h2>
          <p>{{ actividad.categoria }} · {{ actividad.ciudad }}</p>
          <p>Fecha: {{ formatearFecha(actividad.fecha) }}</p>
          <p>Cupo: {{ actividad.cupo }} · Precio: ${{ actividad.precio }}</p>
        </div>

        <div class="acciones">
          <span :class="actividad.activa ? 'estado-activo' : 'estado-inactivo'">
            {{ actividad.activa ? 'Activa' : 'Inactiva' }}
          </span>

          <RouterLink
            :to="{ name: 'actividad-editar', params: { id: actividad.id } }"
            class="boton-editar"
          >
            Editar
          </RouterLink>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.admin-actividades {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.tarjeta,
.actividad {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
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

.boton-editar,
.boton-secundario {
  padding: 9px 14px;
  border-radius: 8px;
  background: #2563eb;
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
