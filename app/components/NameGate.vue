<template>
  <form class="join d-flex flex-column ga-8 mx-auto w-100" @submit.prevent="submit">
    <div class="d-flex flex-column ga-3">
      <p class="eyebrow text-primary">Te han invitado</p>
      <h1 class="h-join">¿Cómo te llamas?</h1>
      <p class="body-text">
        Así sabremos quién ha añadido cada cosa a «{{ listName }}».
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

      <div class="join-preview d-flex flex-column ga-3">
        <span class="page-sub">Elige tu color en la lista</span>
        <ColorPicker v-model="color" :name="name" />
      </div>
    </div>

    <p v-if="taken" class="text-error">Ya hay alguien con ese nombre en la lista. Prueba con otro.</p>
    <p v-else-if="error" class="text-error">{{ error }}</p>

    <div class="flex-1-1-0" />

    <v-btn
      type="submit"
      color="primary"
      :height="56"
      class="btn w-100"
      :disabled="!name.trim() || taken || saving"
    >
      Entrar a la lista
    </v-btn>
  </form>
</template>

<script setup lang="ts">
import { colorForIndex, isNameTaken } from '#shared/utils/members'

const { name: listName } = storeToRefs(useListStore())
const membersStore = useMembersStore()
const { members } = storeToRefs(membersStore)
const { join } = membersStore
const { user } = useFirebase()

const name = ref('')
const saving = ref(false)
const error = ref('')

/** Sale marcado el siguiente de la paleta, pero puedes elegir otro. */
const color = ref(colorForIndex(members.value.length))
/** Aviso en vivo: join() lo vuelve a comprobar antes de guardar. */
const taken = computed(() => isNameTaken(name.value, members.value, user.uid))

async function submit() {
  if (!name.value.trim() || taken.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await join(name.value, color.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se ha podido entrar'
  } finally {
    saving.value = false
  }
}
</script>
