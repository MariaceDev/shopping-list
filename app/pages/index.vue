<template>
  <div class="page page-list mx-auto w-100">
    <header class="d-flex flex-column ga-4 px-6 pt-4 pb-5">
      <div class="d-flex flex-column ga-1">
        <!-- El título y los avatares en la misma fila, centrados en vertical. -->
        <div class="d-flex justify-space-between align-center ga-3">
          <h1 class="text-truncate flex-1-1-0 min-w-0">{{ listName }}</h1>
          <!-- Los avatares se solapan, cada uno con su aro del color del fondo. -->
          <!-- El tuyo es un botón: abre la hoja para cambiar tu nombre y color. -->
          <div class="d-flex flex-shrink-0 ps-2">
            <component
              :is="member.uid === me?.uid ? 'button' : 'span'"
              v-for="(member, index) in members"
              :key="member.uid"
              :type="member.uid === me?.uid ? 'button' : undefined"
              :aria-label="member.uid === me?.uid ? 'Cambiar tu nombre y color' : undefined"
              class="avatar-slot d-flex rounded-circle"
              :class="{ 'ms-n2': index > 0 }"
              @click="member.uid === me?.uid && (profileOpen = true)"
            >
              <AppAvatar
                :name="member.name"
                :color="member.color"
                :size="32"
                class="border-md border-background border-opacity-100"
              />
            </component>
          </div>
        </div>
        <p class="page-sub">{{ subtitle }}</p>
      </div>
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
      No hay nada en la lista
    </p>

    <ProfileSheet v-model="profileOpen" />
  </div>
</template>

<script setup lang="ts">
const { name: listName } = storeToRefs(useListStore())
const { members, me } = storeToRefs(useMembersStore())
const profileOpen = ref(false)

const listStore = useShoppingListStore()
const { items, loading, pending } = storeToRefs(listStore)
const { setQty } = listStore

/**
 * Lo que falta por coger, en unidades: «Leche ×3» son 3. Añadir otra vez un
 * producto que ya está suma unidades, y el contador tiene que reflejarlo.
 */
const subtitle = computed<string>(() => {
  if (loading.value) return 'Cargando…'
  const count = pending.value.reduce((total, item) => total + item.qty, 0)
  if (count === 0) return 'No falta nada'
  return count === 1 ? 'Falta 1 producto' : `Faltan ${count} productos`
})
</script>
