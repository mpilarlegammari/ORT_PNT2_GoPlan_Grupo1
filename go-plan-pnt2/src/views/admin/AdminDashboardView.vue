<script setup>
import { ref } from 'vue'

// Por ahora no tenemos conectadas las métricas al backend.
const actividadesActivas = ref(null)
const actividadesInactivas = ref(null)
const totalReservas = ref(null)
const actividadMasReservada = ref(null)
</script>

<template>
  <main class="admin-dashboard">
    <h1>Panel de administración</h1>
    <p>Bienvenido al panel de administración de GoPlan.</p>

    <section class="estadisticas">
      <h2>Estadísticas generales</h2>

      <div class="tarjetas">
        <article class="tarjeta">
          <h3>Actividades activas</h3>
          <p>{{ actividadesActivas ?? 'Sin datos' }}</p>
        </article>

        <article class="tarjeta">
          <h3>Actividades inactivas</h3>
          <p>{{ actividadesInactivas ?? 'Sin datos' }}</p>
        </article>

        <article class="tarjeta">
          <h3>Total de reservas</h3>
          <p>{{ totalReservas ?? 'Sin datos' }}</p>
        </article>

        <article class="tarjeta">
          <h3>Actividad más reservada</h3>
          <p>{{ actividadMasReservada ?? 'Sin datos' }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-dashboard {
  padding: 30px;
}

.estadisticas {
  margin-top: 30px;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tarjeta {
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #fff;
}

.tarjeta h3 {
  margin-bottom: 15px;
  font-size: 16px;
}

.tarjeta p {
  font-size: 24px;
  font-weight: bold;
}
</style>
