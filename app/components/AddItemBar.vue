<template>
  <form class="adder position-fixed left-0 right-0 bg-background border-t" @submit.prevent="submit">
    <div class="adder-inner d-flex ga-2 mx-auto px-4">
      <v-text-field
        v-model="name"
        class="adder-field"
        density="comfortable"
        placeholder="Añadir producto…"
        maxlength="60"
        enterkeyhint="done"
        aria-label="Nombre del producto"
      />
      <v-btn type="submit" color="secondary" :width="48" :height="48" class="adder-btn" aria-label="Añadir">
        +
      </v-btn>
    </div>
  </form>
</template>

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
