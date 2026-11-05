<script setup lang="ts">
import type { ListMember, ShoppingItem } from '#shared/types/shopping'
import { colorForIndex } from '#shared/types/shopping'

const props = defineProps<{ item: ShoppingItem, members: ListMember[] }>()

defineEmits<{ qty: [qty: number], toggle: [] }>()

const author = computed(
  () => props.members.find((m) => m.uid === props.item.addedByUid) ?? null,
)
const authorColor = computed(() => author.value?.color ?? colorForIndex(0))
const when = computed(() => relativeTime(props.item.createdAt))
</script>

<template>
  <li class="row card" :class="{ done: item.done }">
    <button class="main" type="button" @click="$emit('toggle')">
      <span class="name">{{ item.name }}</span>
      <span class="meta">
        <AppAvatar :name="item.addedByName" :color="authorColor" :size="22" />
        <span class="muted">{{ item.addedByName }}</span>
        <span v-if="when" class="muted">· {{ when }}</span>
      </span>
    </button>

    <div class="stepper">
      <button type="button" aria-label="Quitar uno" @click="$emit('qty', item.qty - 1)">−</button>
      <span class="qty">{{ item.qty }}</span>
      <button type="button" aria-label="Añadir uno" @click="$emit('qty', item.qty + 1)">+</button>
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

.row.done .name {
  text-decoration: line-through;
  color: var(--text-soft);
}

.main {
  flex: 1;
  display: grid;
  gap: 4px;
  justify-items: start;
  text-align: left;
  background: none;
  border: 0;
  padding: 0;
}

.name {
  font-size: 19px;
  font-weight: 600;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f5f5f4;
  border-radius: 999px;
  padding: 4px;
  flex: none;
}

.stepper button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: var(--surface);
  font-size: 18px;
  line-height: 1;
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}

.qty {
  min-width: 26px;
  text-align: center;
  font-weight: 600;
}
</style>
