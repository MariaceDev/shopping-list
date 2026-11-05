<script setup lang="ts">
/**
 * Pide la lista aquí, y no en el layout, a propósito: este componente solo se
 * monta cuando ya eres miembro. Si el layout abriese la suscripción antes de
 * que entres, Firestore respondería permission-denied y el listener se
 * quedaría muerto aunque luego te unieras.
 */
const { addItem } = useShoppingList()

const name = ref('')

async function submit() {
  const clean = name.value.trim()
  if (!clean) return
  name.value = ''
  await addItem(clean)
}
</script>

<template>
  <form class="adder" @submit.prevent="submit">
    <div class="inner">
      <input
        v-model="name"
        type="text"
        placeholder="Añadir producto…"
        maxlength="60"
        enterkeyhint="done"
        aria-label="Nombre del producto"
      >
      <button type="submit" class="add-btn" aria-label="Añadir">+</button>
    </div>
  </form>
</template>

<style scoped>
.adder {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--nav-h);
  background: var(--bg);
  border-top: 1px solid var(--line);
}

.inner {
  display: flex;
  gap: 8px;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 10px 16px;
}

input {
  flex: 1;
  min-width: 0;
  min-height: 48px;
  background: var(--surface);
  border: 0;
  border-radius: var(--radius-sm);
  padding: 0 16px;
  font-size: 16px;
  outline: none;
}

input::placeholder {
  color: var(--placeholder);
  opacity: 1;
}

.add-btn {
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: var(--radius-sm);
  background: var(--plum);
  color: var(--bg);
  font-size: 24px;
  line-height: 1;
}
</style>
