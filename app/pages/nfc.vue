<template>
  <div class="nfc d-flex flex-column align-center justify-center ga-10 pa-8 mx-auto w-100 text-center">
    <div class="nfc-ring position-relative d-flex align-center justify-center flex-shrink-0">
      <span
        v-for="delay in [0, 0.7, 1.4]"
        :key="delay"
        class="nfc-pulse rounded-circle"
        :style="{ animationDelay: `${delay}s` }"
      />
      <span class="nfc-core d-flex align-center justify-center position-relative rounded-circle bg-primary text-background font-weight-bold">
        NFC
      </span>
    </div>

    <div class="nfc-copy d-flex flex-column">
      <h1 class="h-nfc">Pega un tag NFC en la nevera</h1>
      <p class="body-text">
        Quien lo acerque al móvil abrirá esta lista, con lo que haya
        añadido cualquiera de la familia.
      </p>
    </div>

    <div class="d-flex flex-column ga-3 w-100">
      <v-btn
        v-if="supported"
        color="secondary"
        rounded="pill"
        :height="54"
        class="w-100 px-7"
        :disabled="writing"
        @click="writeTag"
      >
        Grabar el tag
      </v-btn>
      <v-btn rounded="pill" :height="54" class="nfc-link w-100 px-7" @click="copyLink">
        Copiar enlace
      </v-btn>

      <p v-if="!supported" class="note">
        Para grabar el tag desde aquí hace falta Chrome en Android. En otros
        dispositivos, copia el enlace y grábalo con una app de NFC.
      </p>
      <p v-if="status" class="note">{{ status }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { listLink } from '#shared/utils/list'

const listId = useListId()
const url = ref('')
const status = ref('')
const writing = ref(false)

onMounted(() => {
  url.value = listLink(window.location.origin, listId)
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
