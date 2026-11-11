<script setup>
defineProps({ disabled: Boolean })
</script>

<template>
  <div>
    <div class="separador"><span>o continuá con</span></div>
    <button class="google" type="button" :disabled="disabled">
      <span class="google-icono" aria-hidden="true">G</span>
      Continuar con Google
    </button>
  </div>
</template>
