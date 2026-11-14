<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'current-password' },
  minlength: { type: Number, default: undefined },
  maxlength: { type: Number, default: 128 },
  disabled: Boolean,
  ayuda: { type: String, default: '' },
})
const valor = defineModel({ type: String, default: '' })
const visible = defineModel('visible', { type: Boolean, default: false })
</script>

<template>
  <div class="campo">
    <label :for="id">{{ label }}</label>
    <div class="password">
      <input
        :id="id"
        v-model="valor"
        :type="visible ? 'text' : 'password'"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :minlength="minlength"
        :maxlength="maxlength"
        :disabled="disabled"
        :aria-describedby="ayuda ? `${id}-ayuda` : undefined"
        required
      />
      <button
        class="mostrar"
        type="button"
        :aria-pressed="visible"
        :aria-controls="id"
        :disabled="disabled"
        @click="visible = !visible"
      >
        {{ visible ? 'Ocultar' : 'Mostrar' }}
      </button>
    </div>
    <small v-if="ayuda" :id="`${id}-ayuda`">{{ ayuda }}</small>
  </div>
</template>
