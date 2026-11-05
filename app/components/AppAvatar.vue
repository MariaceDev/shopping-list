<template>
  <v-avatar
    :color="color"
    :size="size"
    class="font-weight-semibold"
    :style="{
      color: inkFor(color),
      fontSize: `${Math.max(9, Math.round(size * 0.42))}px`,
      lineHeight: 1,
    }"
    :title="name"
  >
    {{ initial }}
  </v-avatar>
</template>

<script setup lang="ts">
import { initialOf, inkFor } from '#shared/types/shopping'

const props = withDefaults(
  defineProps<{ name: string, color: string, size?: number }>(),
  { size: 32 },
)

const initial = computed(() => initialOf(props.name))
</script>
