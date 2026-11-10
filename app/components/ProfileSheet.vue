<template>
  <v-bottom-sheet v-model="open" :max-width="520">
    <form class="sheet d-flex flex-column ga-6" @submit.prevent="save">
      <div class="d-flex flex-column ga-2">
        <p class="eyebrow text-primary">Tu perfil</p>
        <h2 class="h-sheet">Tu nombre y tu color</h2>
      </div>

      <v-text-field
        v-model="name"
        class="name-field"
        autocomplete="given-name"
        placeholder="Tu nombre"
        maxlength="24"
        aria-label="Tu nombre"
      />

      <div class="d-flex flex-column ga-3">
        <p class="page-sub">Tu color en la lista</p>
        <ColorPicker v-model="color" :name="name" />
      </div>

      <p v-if="taken" class="text-error">Ya hay alguien con ese nombre en la lista. Prueba con otro.</p>
      <p v-else-if="error" class="text-error">{{ error }}</p>

      <v-btn
        type="submit"
        color="primary"
        :height="56"
        class="btn w-100"
        :disabled="!name.trim() || taken || !changed || saving"
      >
        Guardar
      </v-btn>

      <!-- Para pasar el enlace o montar otra lista (la de otra casa). -->
      <div class="d-flex flex-column">
        <v-btn variant="text" :height="44" class="btn w-100" @click="copyLink">
          {{ copied ? 'Enlace copiado' : 'Copiar el enlace de esta lista' }}
        </v-btn>
        <v-btn to="/nueva" variant="text" :height="44" class="btn w-100">
          Crear otra lista
        </v-btn>
      </div>
    </form>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { listLink } from '#shared/utils/list'
import { MEMBER_COLORS, isNameTaken } from '#shared/utils/members'

const open = defineModel<boolean>({ required: true })

const membersStore = useMembersStore()
const { members, me } = storeToRefs(membersStore)
const { updateProfile } = membersStore
const { user } = useFirebase()

const name = ref('')
const color = ref('')
const saving = ref(false)
const error = ref('')
const copied = ref(false)
const listId = useListId()

// Cada vez que se abre, parte de lo que hay guardado.
watch(open, (isOpen) => {
  if (!isOpen) return
  name.value = me.value?.name ?? ''
  color.value = me.value?.color ?? MEMBER_COLORS[0]
  error.value = ''
  copied.value = false
}, { immediate: true })

async function copyLink() {
  await navigator.clipboard.writeText(listLink(window.location.origin, listId))
  copied.value = true
}

/** Aviso en vivo: updateProfile() lo vuelve a comprobar antes de guardar. */
const taken = computed(() => isNameTaken(name.value, members.value, user.uid))
const changed = computed(
  () => name.value.trim() !== me.value?.name || color.value !== me.value?.color,
)

async function save() {
  if (!name.value.trim() || taken.value || !changed.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await updateProfile(name.value, color.value)
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se ha podido guardar'
  } finally {
    saving.value = false
  }
}
</script>
