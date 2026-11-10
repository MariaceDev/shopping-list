<template>
  <div class="shop d-flex flex-column bg-primary">
    <header class="shop-head d-flex flex-column mx-auto w-100">
      <div class="d-flex justify-space-between align-center ga-3">
        <p class="shop-eyebrow">Modo tienda</p>
        <v-btn to="/" variant="text" rounded="pill" :height="34" class="shop-exit">Salir</v-btn>
      </div>

      <p class="shop-count">{{ taken }} de {{ items.length }} en el carrito</p>

      <v-progress-linear
        :model-value="progress"
        color="accent"
        bg-color="white"
        :bg-opacity="0.2"
        :height="6"
        rounded
        rounded-bar
      />
    </header>

    <div class="shop-sheet d-flex flex-column flex-1-1-0 bg-background mx-auto w-100 pt-4 px-4 pb-3">
      <ul class="d-flex flex-column ga-2">
        <li v-for="item in ordered" :key="item.id">
          <v-card
            tag="button"
            type="button"
            class="shop-row d-flex align-center ga-4 w-100 text-left"
            :aria-pressed="item.done"
            @click="toggleDone(item.id)"
          >
            <span
              class="shop-check d-flex align-center justify-center flex-shrink-0 rounded-circle"
              :class="{ 'shop-check-on bg-primary': item.done }"
              aria-hidden="true"
            >
              <v-icon v-if="item.done" icon="mdi-check" :size="18" />
            </span>
            <span
              class="shop-name flex-1-1-0 min-w-0"
              :class="{ 'text-faded text-decoration-line-through': item.done }"
            >{{ item.name }}</span>
            <span
              class="shop-qty flex-shrink-0"
              :class="item.done ? 'text-faded' : 'text-muted font-weight-semibold'"
            >×{{ item.qty }}</span>
          </v-card>
        </li>
      </ul>

      <p v-if="!items.length" class="py-12 px-4 text-center text-meta">No hay nada que comprar.</p>

      <div class="shop-foot mt-auto">
        <v-btn
          color="secondary"
          :height="53"
          class="w-100"
          :disabled="!taken || closing"
          @click="finish"
        >
          {{ taken ? `Terminar compra (${taken})` : 'Marca lo que ya tienes' }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingItem } from '#shared/types/ShoppingItem.type'

const listStore = useShoppingListStore()
const { items, inCart, pending } = storeToRefs(listStore)
const { toggleDone, finishTrip } = listStore

/** Como en el prototipo: lo que falta primero, lo ya cogido al final. */
const ordered = computed<ShoppingItem[]>(() => [...pending.value, ...inCart.value])

const taken = computed(() => inCart.value.length)
const progress = computed(() =>
  items.value.length ? (taken.value / items.value.length) * 100 : 0,
)

const closing = ref(false)

async function finish() {
  if (!taken.value || closing.value) return
  closing.value = true
  try {
    await finishTrip()
    await navigateTo('/')
  } finally {
    closing.value = false
  }
}
</script>
