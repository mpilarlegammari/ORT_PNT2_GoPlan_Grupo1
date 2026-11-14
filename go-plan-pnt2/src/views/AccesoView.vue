<template>
  <div class="auth-page">
    <div class="login-page">
      <aside class="presentacion" aria-label="Bienvenido a GoPlan">
        <RouterLink class="logo" to="/">GoPlan<span>.</span></RouterLink>
        <div class="mensaje">
          <h2>
            Un nuevo plan.<br /><span>Una nueva<br />versión de vos.</span>
          </h2>
          <p>
            Descubrí eso que te mueve. Un taller, una clase, un momento para hacer algo distinto.
          </p>
          <div class="invitacion">
            <span class="estrella" aria-hidden="true">✳</span>
            <p>Hacé lugar para<br /><strong>tu próximo plan.</strong></p>
            <span class="etiqueta">Descubrí · Reservá · Viví</span>
          </div>
        </div>
      </aside>
      <section class="acceso" aria-label="Acceso a GoPlan">
        <div class="formulario">
          <p class="bajada">TU PRÓXIMO PLAN EMPIEZA ACÁ</p>
          <RouterView />
          <p class="pie-formulario">Descubrí nuevas experiencias con GoPlan.</p>
          <RouterLink class="volver" to="/">← Volver al inicio</RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style src="../assets/auth.css"></style>
