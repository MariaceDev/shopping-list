<script setup lang="ts">
const emit = defineEmits<{ join: [name: string] }>()

const name = ref('')
const saving = ref(false)
const error = ref('')

async function submit() {
  if (!name.value.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    emit('join', name.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se ha podido entrar'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="gate">
    <h1>¿Cómo te llamas?</h1>
    <p class="muted">
      Te han invitado a la lista de la compra. Tu nombre aparecerá junto a los
      productos que añadas.
    </p>

    <form @submit.prevent="submit">
      <input
        v-model="name"
        class="field"
        type="text"
        autocomplete="given-name"
        placeholder="Tu nombre"
        maxlength="24"
        autofocus
      >
      <button class="primary" type="submit" :disabled="!name.trim() || saving">
        Entrar a la lista
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.gate {
  max-width: 420px;
  margin: 0 auto;
  padding: 72px 24px;
}

h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

p {
  margin: 0 0 28px;
}

form {
  display: grid;
  gap: 12px;
}

.field {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  outline: none;
}

.field:focus {
  border-color: var(--accent);
}

.primary {
  background: var(--accent);
  color: var(--accent-ink);
  border: 0;
  border-radius: var(--radius-sm);
  padding: 15px 18px;
  font-weight: 600;
}

.primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  margin-top: 14px;
}
</style>
