<script setup lang="ts">
const url = ref('')
const status = ref('')
const writing = ref(false)

onMounted(() => {
  url.value = window.location.origin
})

/** Web NFC solo existe en Chrome para Android. */
const supported = computed(
  () => import.meta.client && 'NDEFReader' in window,
)

async function writeTag() {
  if (!supported.value || writing.value) return
  writing.value = true
  status.value = 'Acerca el tag al móvil…'
  try {
    // @ts-expect-error NDEFReader aún no está en los tipos del DOM.
    const writer = new NDEFReader()
    await writer.write({ records: [{ recordType: 'url', data: url.value }] })
    status.value = '✅ Tag grabado'
  } catch (e) {
    status.value = e instanceof Error ? `No se pudo grabar: ${e.message}` : 'No se pudo grabar'
  } finally {
    writing.value = false
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(url.value)
  status.value = '✅ Enlace copiado'
}
</script>

<template>
  <div class="page">
    <h1>Tag NFC</h1>
    <p class="muted">
      Pega un tag NFC en la nevera. Quien lo acerque al móvil entra en la
      lista: si es la primera vez, le pedimos el nombre.
    </p>

    <div class="card link">
      <code>{{ url || '…' }}</code>
    </div>

    <div class="actions">
      <button type="button" class="secondary" @click="copyLink">Copiar enlace</button>
      <button
        v-if="supported"
        type="button"
        class="primary"
        :disabled="writing"
        @click="writeTag"
      >
        Grabar el tag
      </button>
    </div>

    <p v-if="!supported" class="muted note">
      Para grabar el tag desde aquí hace falta Chrome en Android. En otros
      dispositivos, copia el enlace y grábalo con una app de NFC.
    </p>

    <p v-if="status" class="status">{{ status }}</p>
  </div>
</template>

<style scoped>
h1 {
  font-size: 30px;
}

h1 + p {
  margin: 6px 0 22px;
}

.link {
  padding: 16px;
  overflow-wrap: anywhere;
}

code {
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

button {
  flex: 1;
  border-radius: var(--radius-sm);
  padding: 14px;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--surface);
}

.primary {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}

button:disabled {
  opacity: 0.5;
}

.note,
.status {
  margin-top: 18px;
  font-size: 14px;
}
</style>
