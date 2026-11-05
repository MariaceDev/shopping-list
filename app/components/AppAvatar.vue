<script setup lang="ts">
import { initialOf, inkFor } from '#shared/types/shopping'

const props = withDefaults(
  defineProps<{ name: string, color: string, size?: number }>(),
  { size: 32 },
)

const initial = computed(() => initialOf(props.name))
</script>

<template>
  <span
    class="avatar"
    :style="{
      background: color,
      color: inkFor(color),
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.max(9, Math.round(size * 0.42))}px`,
    }"
    :title="name"
  >{{ initial }}</span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  line-height: 1;
  flex: none;
}
</style>
