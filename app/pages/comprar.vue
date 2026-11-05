<script setup lang="ts">
const { items, inCart, toggleDone, finishTrip } = useShoppingList()

/** Como en el prototipo: lo que falta primero, lo ya cogido al final. */
const ordered = computed(() => [
  ...items.value.filter((i) => !i.done),
  ...items.value.filter((i) => i.done),
])

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

<template>
  <div class="shop">
    <header class="shop-head">
      <div class="top">
        <p class="shop-eyebrow">Modo tienda</p>
        <NuxtLink to="/" class="exit">Salir</NuxtLink>
      </div>

      <p class="count">{{ taken }} de {{ items.length }} en el carro</p>

      <div class="bar">
        <span :style="{ width: `${progress}%` }" />
      </div>
    </header>

    <div class="shop-sheet">
      <ul class="rows">
        <li v-for="item in ordered" :key="item.id">
          <button
            type="button"
            class="row shop-row card"
            :aria-pressed="item.done"
            @click="toggleDone(item.id)"
          >
            <span class="check" :class="{ on: item.done }" aria-hidden="true">
              {{ item.done ? '✓' : '' }}
            </span>
            <span class="shop-name" :class="{ done: item.done }">{{ item.name }}</span>
            <span class="qty" :class="item.done ? 'done' : 'meta-qty'">×{{ item.qty }}</span>
          </button>
        </li>
      </ul>

      <p v-if="!items.length" class="empty">No hay nada que comprar.</p>

      <div class="shop-foot">
        <button type="button" class="btn btn-ink finish" :disabled="!taken || closing" @click="finish">
          {{ taken ? `Terminar compra (${taken})` : 'Marca lo que ya tienes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--teal);
  color: #fff;
}

.shop-head {
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: calc(12px + env(safe-area-inset-top)) 24px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.shop-eyebrow {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
  white-space: nowrap;
}

.exit {
  background: rgb(255 255 255 / 16%);
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  height: 34px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.count {
  font-size: 34px;
  font-weight: 600;
  line-height: 1.15;
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: rgb(255 255 255 / 20%);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--lime);
  transition: width 0.2s ease;
}

.shop-sheet {
  flex: 1;
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--ink);
  border-radius: 28px 28px 0 0;
  padding: 16px 16px 12px;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  text-align: left;
}

.shop-row {
  padding: 16px 18px;
  gap: 16px;
}

.check {
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 50%;
  border: 2px solid #c7c3cc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.check.on {
  background: var(--teal);
  border: 0;
  color: #fff;
}

.shop-name {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 500;
}

.qty {
  flex: none;
  font-size: 15px;
}

.meta-qty {
  color: var(--muted);
  font-weight: 600;
}

.done {
  color: var(--faded);
}

.shop-name.done {
  text-decoration: line-through;
}

.empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--meta);
}

.shop-foot {
  margin-top: auto;
  padding: 10px 0 calc(14px + env(safe-area-inset-bottom));
}

.finish {
  height: 53px;
}
</style>
