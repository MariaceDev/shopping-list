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
    status.value = 'Tag grabado'
  } catch (e) {
    status.value = e instanceof Error ? `No se pudo grabar: ${e.message}` : 'No se pudo grabar'
  } finally {
    writing.value = false
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(url.value)
  status.value = 'Enlace copiado'
}
</script>

<template>
  <div class="nfc">
    <div class="nfc-ring">
      <span v-for="delay in [0, 0.7, 1.4]" :key="delay" class="pulse" :style="{ animationDelay: `${delay}s` }" />
      <span class="nfc-core">NFC</span>
    </div>

    <div class="copy">
      <h1 class="h-nfc">Pega un tag NFC en la nevera</h1>
      <p class="body">
        Quien lo acerque al móvil abrirá la lista de casa, con lo que haya
        añadido cualquiera de la familia.
      </p>
    </div>

    <div class="actions">
      <button
        v-if="supported"
        type="button"
        class="btn btn-ink tag-btn"
        :disabled="writing"
        @click="writeTag"
      >
        Grabar el tag
      </button>
      <button type="button" class="btn link-btn" @click="copyLink">Copiar enlace</button>

      <p v-if="!supported" class="note">
        Para grabar el tag desde aquí hace falta Chrome en Android. En otros
        dispositivos, copia el enlace y grábalo con una app de NFC.
      </p>
      <p v-if="status" class="note">{{ status }}</p>
    </div>
  </div>
</template>

<style scoped>
.nfc {
  min-height: calc(100dvh - var(--nav-h));
  max-width: var(--page-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 40px;
  text-align: center;
}

.nfc-ring {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--teal);
  opacity: 0;
  animation: pulse 2.1s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }

  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse {
    animation: none;
    opacity: 0.25;
  }
}

.nfc-core {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--teal);
  color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 0.06em;
  position: relative;
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.h-nfc {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.15;
  text-wrap: pretty;
}

.body {
  font-size: 16px;
  line-height: 1.45;
  color: var(--muted);
  text-wrap: pretty;
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-btn,
.link-btn {
  height: 54px;
  border-radius: 999px;
  padding: 0 28px;
}

.link-btn {
  background: var(--surface);
  box-shadow: var(--card-line);
}

.note {
  color: var(--meta);
  font-size: 13px;
  text-wrap: pretty;
}
</style>
