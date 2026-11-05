<script setup lang="ts">
const emit = defineEmits<{ add: [name: string] }>()

const name = ref('')

function submit() {
  const clean = name.value.trim()
  if (!clean) return
  emit('add', clean)
  name.value = ''
}
</script>

<template>
  <form class="bar" @submit.prevent="submit">
    <input
      v-model="name"
      type="text"
      placeholder="Añadir producto…"
      maxlength="60"
      enterkeyhint="done"
    >
    <button type="submit" aria-label="Añadir" :disabled="!name.trim()">+</button>
  </form>
</template>

<style scoped>
.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--nav-h);
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 560px;
  margin: 0 auto;
  padding: 12px 20px;
  background: linear-gradient(to top, var(--bg) 70%, transparent);
}

input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 15px 20px;
  outline: none;
}

input:focus {
  border-color: var(--accent);
}

button {
  width: 54px;
  height: 54px;
  flex: none;
  border: 0;
  border-radius: 18px;
  background: #3b0764;
  color: #fff;
  font-size: 26px;
  line-height: 1;
}

button:disabled {
  opacity: 0.4;
}
</style>
