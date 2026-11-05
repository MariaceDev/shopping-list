<script setup lang="ts">
const { members } = useListMembers()
const { items, loading, setQty } = useShoppingList()

/** El diseño cuenta lo que falta por coger, no el total de la lista. */
const pending = computed(() => items.value.filter((i) => !i.done).length)

const subtitle = computed(() => {
  if (loading.value) return 'Cargando…'
  if (pending.value === 0) return 'No falta nada'
  return pending.value === 1 ? 'Falta 1 producto' : `Faltan ${pending.value} productos`
})
</script>

<template>
  <div class="page">
    <header class="head">
      <div class="title-row">
        <div class="title">
          <h1>Lista de casa</h1>
          <p class="page-sub">{{ subtitle }}</p>
        </div>
        <div class="people">
          <AppAvatar
            v-for="member in members"
            :key="member.uid"
            :name="member.name"
            :color="member.color"
            :size="32"
          />
        </div>
      </div>

      <NuxtLink to="/comprar" class="btn btn-teal shop">Empezar a comprar</NuxtLink>
    </header>

    <ul class="scroll">
      <ItemRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        :members="members"
        @qty="setQty(item.id, $event)"
      />
    </ul>

    <p v-if="!loading && !items.length" class="empty">
      No falta nada. Añade lo primero abajo.
    </p>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--page-max);
  margin: 0 auto;
  padding-bottom: calc(var(--nav-h) + 80px);
}

.head {
  padding: 16px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.title {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

h1 {
  white-space: nowrap;
}

.people {
  display: flex;
  flex-shrink: 0;
  padding-left: 8px;
}

/* Los avatares se solapan, cada uno con su aro del color del fondo. */
.people > * {
  border: 2px solid var(--bg);
}

.people > :not(:first-child) {
  margin-left: -8px;
}

.shop {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 51px;
  text-decoration: none;
}

.scroll {
  padding: 0 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--meta);
}
</style>
