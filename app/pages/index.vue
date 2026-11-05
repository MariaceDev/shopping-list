<template>
  <div class="page page-list mx-auto w-100">
    <header class="d-flex flex-column ga-4 px-6 pt-4 pb-5">
      <div class="d-flex justify-space-between align-start ga-3">
        <div class="d-flex flex-column flex-1-1-0 ga-1 min-w-0">
          <h1 class="text-no-wrap">Lista de casa</h1>
          <p class="page-sub">{{ subtitle }}</p>
        </div>
        <!-- Los avatares se solapan, cada uno con su aro del color del fondo. -->
        <div class="d-flex flex-shrink-0 ps-2">
          <AppAvatar
            v-for="(member, index) in members"
            :key="member.uid"
            :name="member.name"
            :color="member.color"
            :size="32"
            class="border-md border-background border-opacity-100"
            :class="{ 'ms-n2': index > 0 }"
          />
        </div>
      </div>

      <v-btn to="/comprar" color="primary" :height="51" class="btn w-100">
        Empezar a comprar
      </v-btn>
    </header>

    <ul class="d-flex flex-column ga-2 px-4 pb-3">
      <ItemRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        :members="members"
        @qty="setQty(item.id, $event)"
      />
    </ul>

    <p v-if="!loading && !items.length" class="py-12 px-4 text-center text-meta">
      No falta nada. Añade lo primero abajo.
    </p>
  </div>
</template>

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
