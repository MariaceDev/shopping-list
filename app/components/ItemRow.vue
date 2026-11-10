<template>
  <v-card tag="li" class="item-row d-flex align-center ga-3">
    <div class="item-main d-flex flex-column flex-1-1-0 min-w-0">
      <p class="item-name">{{ item.name }}</p>
      <p class="meta item-meta d-flex align-center min-w-0">
        <AppAvatar :name="authorName" :color="authorColor" :size="16" />
        <span class="text-truncate">
          {{ authorName }}<template v-if="when"> · {{ when }}</template>
        </span>
      </p>
    </div>

    <div class="stepper d-flex align-center flex-shrink-0 bg-track rounded-pill">
      <v-btn
        icon="mdi-minus"
        variant="text"
        :size="36"
        rounded="circle"
        class="step"
        aria-label="Quitar uno"
        @click="$emit('qty', item.qty - 1)"
      />
      <span class="stepper-qty text-center font-weight-semibold">{{ item.qty }}</span>
      <!-- Solo el "+" va en círculo blanco: es la acción que el diseño destaca. -->
      <v-btn
        icon="mdi-plus"
        :size="36"
        rounded="circle"
        class="step"
        aria-label="Añadir uno"
        @click="$emit('qty', item.qty + 1)"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { ListMember } from '#shared/types/ListMember.type'
import type { ShoppingItem } from '#shared/types/ShoppingItem.type'
import { colorForIndex } from '#shared/utils/members'

const props = defineProps<{ item: ShoppingItem, members: ListMember[] }>()

defineEmits<{ qty: [qty: number] }>()

const author = computed(
  () => props.members.find((m) => m.uid === props.item.addedByUid) ?? null,
)
const authorColor = computed(() => author.value?.color ?? colorForIndex(0))
const authorName = computed(() => author.value?.name ?? props.item.addedByName)

const now = useNow()
const when = computed(() => relativeTime(props.item.createdAt, now.value))
</script>
