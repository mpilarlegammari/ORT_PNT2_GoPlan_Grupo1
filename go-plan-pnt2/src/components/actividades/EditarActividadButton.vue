<script setup>
import useAuthStore from '@/stores/authStore'
defineProps({ id: { type: String, required: true } })
const auth = useAuthStore()
</script>

<template>
  <RouterLink
    v-if="auth.isAdmin"
    :to="{ name: 'actividad-editar', params: { id } }"
    class="btn-editar"
    >Editar</RouterLink
  >
</template>

<style scoped>
.btn-editar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1rem;
  border: 1px solid #2563eb;
  border-radius: 8px;
  background: #fff;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}
.btn-editar:hover {
  background: #eff6ff;
}
.btn-editar:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}
</style>
