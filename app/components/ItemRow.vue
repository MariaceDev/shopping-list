<script setup lang="ts">
import type { ListMember, ShoppingItem } from '#shared/types/shopping'
import { colorForIndex } from '#shared/types/shopping'

const props = defineProps<{ item: ShoppingItem, members: ListMember[] }>()

defineEmits<{ qty: [qty: number] }>()

const author = computed(
  () => props.members.find((m) => m.uid === props.item.addedByUid) ?? null,
)
const authorColor = computed(() => author.value?.color ?? colorForIndex(0))
const when = computed(() => relativeTime(props.item.createdAt))
</script>

<template>
  <li class="row card">
    <div class="main">
      <p class="name">{{ item.name }}</p>
      <p class="meta">
        <AppAvatar :name="item.addedByName" :color="authorColor" :size="16" />
        <span class="ellipsis">
          {{ item.addedByName }}<template v-if="when"> · {{ when }}</template>
        </span>
      </p>
    </div>

    <div class="stepper">
      <button type="button" class="step" aria-label="Quitar uno" @click="$emit('qty', item.qty - 1)">
        −
      </button>
      <span class="qty">{{ item.qty }}</span>
      <button type="button" class="step step-on" aria-label="Añadir uno" @click="$emit('qty', item.qty + 1)">
        +
      </button>
    </div>
  </li>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 14px 18px;
}

.main {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.name {
  font-size: 17px;
  font-weight: 500;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stepper {
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--track);
  border-radius: 999px;
  padding: 3px;
}

.step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
}

/* Solo el "+" va en círculo blanco: es la acción que el diseño destaca. */
.step-on {
  background: var(--surface);
}

.qty {
  min-width: 22px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}
</style>
