<template>
  <form v-if="!link" class="join d-flex flex-column ga-8 mx-auto w-100" @submit.prevent="create">
    <!-- Paso 1: el nombre de la lista. -->
    <div class="d-flex flex-column ga-3">
      <p class="eyebrow text-primary">Lista nueva</p>
      <h1 class="h-join">¿Cómo se llama la lista?</h1>
      <p class="body-text">
        Es una lista aparte, con sus productos y su historial. Solo entra quien
        tenga el enlace.
      </p>
    </div>

    <v-text-field
      v-model="name"
      class="name-field"
      placeholder="Lista de mamá"
      maxlength="32"
      autofocus
      aria-label="Nombre de la lista"
    />

    <p v-if="error" class="text-error">{{ error }}</p>

    <div class="flex-1-1-0" />

    <div class="d-flex flex-column ga-3">
      <v-btn type="submit" color="primary" :height="56" class="btn w-100" :disabled="!name.trim() || saving">
        Crear la lista
      </v-btn>
      <v-btn v-if="$listId" to="/" variant="text" :height="48" class="btn w-100">
        Volver a mi lista
      </v-btn>
    </div>
  </form>

  <div v-else class="join d-flex flex-column ga-8 mx-auto w-100">
    <!-- Paso 2: el enlace para pasárselo a quien la vaya a usar. -->
    <div class="d-flex flex-column ga-3">
      <p class="eyebrow text-primary">Lista creada</p>
      <h1 class="h-join">{{ createdName }}</h1>
      <p class="body-text">
        Pásale este enlace a quien la vaya a usar. Al abrirlo pondrá su nombre
        y su color, y podrá instalar la app desde ahí.
      </p>
    </div>

    <p class="list-link body-text text-break">{{ link }}</p>
    <p v-if="copied" class="note">Enlace copiado</p>

    <div class="flex-1-1-0" />

    <div class="d-flex flex-column ga-3">
      <v-btn color="primary" :height="56" class="btn w-100" @click="copy">
        Copiar el enlace
      </v-btn>
      <v-btn variant="text" :height="48" class="btn w-100" @click="openList">
        Abrir la lista en este móvil
      </v-btn>
      <v-btn v-if="$listId" to="/" variant="text" :height="48" class="btn w-100">
        Volver a mi lista
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { listLink } from '#shared/utils/list'

const { db } = useFirebase()

const name = ref('')
const createdName = ref('')
const link = ref('')
const saving = ref(false)
const error = ref('')
const copied = ref(false)

async function create() {
  if (!name.value.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const listId = await createList(db, name.value)
    createdName.value = name.value.trim()
    link.value = listLink(window.location.origin, listId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se ha podido crear la lista'
  } finally {
    saving.value = false
  }
}

async function copy() {
  await navigator.clipboard.writeText(link.value)
  copied.value = true
}

/** Abrir otra lista recarga la app: los stores leen el id una sola vez. */
function openList() {
  window.location.assign(link.value)
}
</script>
