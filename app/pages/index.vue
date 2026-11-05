<script setup lang="ts">
const { members, me } = useListMembers()
const { pending, bought, loading, addItem, setQty, toggleDone, clearBought }
  = useShoppingList()

const shopping = ref(false)

/**
 * "Empezar a comprar" entra en modo compra: tocar un producto lo marca como
 * cogido. Al terminar, lo cogido sale de la lista y queda en el historial.
 */
async function toggleShopping() {
  if (shopping.value) await clearBought()
  shopping.value = !shopping.value
}

const subtitle = computed(() => {
  const n = pending.value.length
  if (loading.value) return 'Cargando…'
  if (n === 0) return 'No falta nada'
  return `Falta${n === 1 ? '' : 'n'} ${n} producto${n === 1 ? '' : 's'}`
})
</script>

<template>
  <div class="page">
    <header>
      <div>
        <h1>Lista de casa</h1>
        <p class="muted">{{ subtitle }}</p>
      </div>
      <div class="people">
        <AppAvatar
          v-for="member in members"
          :key="member.uid"
          :name="member.name"
          :color="member.color"
          :size="36"
        />
      </div>
    </header>

    <button class="shop" type="button" @click="toggleShopping">
      {{ shopping ? `Terminar la compra (${bought.length})` : 'Empezar a comprar' }}
    </button>

    <ul class="items">
      <ItemRow
        v-for="item in pending"
        :key="item.id"
        :item="item"
        :members="members"
        @qty="setQty(item.id, $event)"
        @toggle="toggleDone(item.id)"
      />
    </ul>

    <template v-if="bought.length">
      <h2 class="section">Ya en el carro</h2>
      <ul class="items">
        <ItemRow
          v-for="item in bought"
          :key="item.id"
          :item="item"
          :members="members"
          @qty="setQty(item.id, $event)"
          @toggle="toggleDone(item.id)"
        />
      </ul>
    </template>

    <p v-if="!loading && !pending.length && !bought.length" class="empty muted">
      La lista está vacía, {{ me?.name }}. Añade lo primero abajo.
    </p>

    <AddItemBar @add="addItem" />
  </div>
</template>

<style scoped>
header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

h1 {
  font-size: 34px;
  letter-spacing: -0.01em;
}

header p {
  margin: 4px 0 0;
}

.people {
  display: flex;
}

.people > :not(:first-child) {
  margin-left: -10px;
}

.shop {
  width: 100%;
  border: 0;
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 19px;
  font-weight: 600;
  padding: 18px;
  margin-bottom: 18px;
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.section {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  margin: 26px 0 12px;
}

.empty {
  text-align: center;
  padding: 48px 0;
}
</style>
