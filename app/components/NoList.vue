<template>
  <form class="join d-flex flex-column ga-8 mx-auto w-100" @submit.prevent="open">
    <div class="d-flex flex-column ga-3">
      <p class="eyebrow text-primary">Lista de la compra</p>
      <h1 class="h-join">Abre tu lista</h1>
      <p class="body-text">
        Abre el enlace que te han pasado. Si te lo han mandado por mensaje y
        estás en la app instalada, pégalo aquí.
      </p>
    </div>

    <div class="d-flex flex-column ga-3">
      <v-text-field
        v-model="link"
        class="name-field"
        placeholder="Pega el enlace"
        inputmode="url"
        autocomplete="off"
        aria-label="Enlace de la lista"
      />
      <p v-if="link.trim() && !listId" class="text-error">Ese enlace no es de ninguna lista.</p>
    </div>

    <div class="flex-1-1-0" />

    <div class="d-flex flex-column ga-3">
      <v-btn type="submit" color="primary" :height="56" class="btn w-100" :disabled="!listId">
        Abrir la lista
      </v-btn>
      <v-btn to="/nueva" variant="text" :height="48" class="btn w-100">
        Crear una lista nueva
      </v-btn>
    </div>
  </form>
</template>

<script setup lang="ts">
import { listIdFromLink, listLink } from '#shared/utils/list'

const link = ref('')
const listId = computed(() => listIdFromLink(link.value))

/** Recarga con el enlace: el plugin de la lista lo guarda y la abre. */
function open() {
  if (!listId.value) return
  window.location.assign(listLink(window.location.origin, listId.value))
}
</script>
