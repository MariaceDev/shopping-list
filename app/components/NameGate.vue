<template>
  <form class="join d-flex flex-column ga-8 mx-auto w-100" @submit.prevent="submit">
    <div class="d-flex flex-column ga-3">
      <p class="eyebrow text-primary">Te han invitado</p>
      <h1 class="h-join">¿Cómo te llamas?</h1>
      <p class="body-text">
        Así sabremos quién ha añadido cada cosa a «Lista de casa».
      </p>
    </div>

    <div class="d-flex flex-column ga-3">
      <v-text-field
        v-model="name"
        class="name-field"
        autocomplete="given-name"
        placeholder="Tu nombre"
        maxlength="24"
        autofocus
      />

      <div class="join-preview d-flex align-center ga-3">
        <AppAvatar :name="initial" :color="myColor" :size="40" />
        <span class="page-sub">Este será tu color en la lista</span>
      </div>
    </div>

    <p v-if="error" class="text-error">{{ error }}</p>

    <div class="flex-1-1-0" />

    <v-btn
      type="submit"
      color="primary"
      :height="56"
      class="btn w-100"
      :disabled="!name.trim() || saving"
    >
      Entrar a la lista
    </v-btn>
  </form>
</template>

<script setup lang="ts">
import { colorForIndex, initialOf } from '#shared/types/shopping'

const emit = defineEmits<{ join: [name: string] }>()

const { members } = useListMembers()

const name = ref('')
const saving = ref(false)
const error = ref('')

/** El color que te va a tocar: el mismo que calcula join(). */
const myColor = computed(() => colorForIndex(members.value.length))
const initial = computed(() => initialOf(name.value))

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
