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

<template>
  <form class="join" @submit.prevent="submit">
    <div class="intro">
      <p class="eyebrow">Te han invitado</p>
      <h1 class="h-join">¿Cómo te llamas?</h1>
      <p class="body">
        Así sabremos quién ha añadido cada cosa a «Lista de casa».
      </p>
    </div>

    <div class="fields">
      <input
        v-model="name"
        class="name-field"
        type="text"
        autocomplete="given-name"
        placeholder="Tu nombre"
        maxlength="24"
        autofocus
      >

      <div class="preview">
        <AppAvatar :name="initial" :color="myColor" :size="40" />
        <span class="page-sub">Este será tu color en la lista</span>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="spacer" />

    <button class="btn btn-teal enter" type="submit" :disabled="!name.trim() || saving">
      Entrar a la lista
    </button>
  </form>
</template>

<style scoped>
.join {
  min-height: 100dvh;
  max-width: var(--page-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 40px 28px calc(24px + env(safe-area-inset-bottom));
  gap: 32px;
}

.intro,
.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eyebrow {
  font-size: 13px;
  font-weight: 600;
  color: var(--teal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.h-join {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.body {
  font-size: 16px;
  line-height: 1.45;
  color: var(--muted);
  text-wrap: pretty;
}

.name-field {
  height: 58px;
  background: var(--surface);
  border: 2px solid var(--line);
  border-radius: 16px;
  padding: 0 18px;
  font-size: 20px;
  outline: none;
}

.name-field::placeholder {
  color: var(--placeholder);
  opacity: 1;
}

.name-field:focus {
  border-color: var(--teal);
}

.preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 2px;
}

.spacer {
  flex: 1;
}

.enter {
  height: 56px;
}

.error {
  color: #b3261e;
}
</style>
