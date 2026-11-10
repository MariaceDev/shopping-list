<template>
  <v-avatar
    :color="color"
    :size="size"
    class="font-weight-semibold"
    :style="{
      color: inkFor(color),
      fontSize: `${Math.max(11, Math.round(size * 0.52))}px`,
      lineHeight: 1,
    }"
    :title="name"
  >
    <span class="initial">{{ initial }}</span>
  </v-avatar>
</template>

<script setup lang="ts">
import { initialOf, inkFor } from '#shared/utils/members'

const props = withDefaults(
  defineProps<{ name: string, color: string, size?: number }>(),
  { size: 32 },
)

const initial = computed(() => initialOf(props.name))
</script>
