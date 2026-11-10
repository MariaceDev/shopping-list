<template>
  <form class="adder position-fixed left-0 right-0 bg-background" @submit.prevent="submit">
    <div class="adder-inner d-flex align-center ga-2 mx-auto px-4">
      <v-text-field
        v-model="name"
        class="adder-field"
        density="comfortable"
        placeholder="Añadir producto…"
        maxlength="60"
        enterkeyhint="done"
        aria-label="Nombre del producto"
      />
      <v-btn
        type="submit"
        icon="mdi-plus"
        color="secondary"
        rounded="btn"
        :width="48"
        :height="48"
        class="adder-btn"
        aria-label="Añadir"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
const { addItem } = useShoppingListStore()

const name = ref('')

async function submit() {
  const clean = name.value.trim()
  if (!clean) return
  name.value = ''
  await addItem(clean)
}
</script>
