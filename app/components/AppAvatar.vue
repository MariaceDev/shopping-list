<script setup lang="ts">
import { initialOf } from '#shared/types/shopping'

const props = withDefaults(
  defineProps<{ name: string, color: string, size?: number }>(),
  { size: 34 },
)

const initial = computed(() => initialOf(props.name))
</script>

<template>
  <span
    class="avatar"
    :style="{
      background: color,
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.44)}px`,
    }"
    :title="name"
  >{{ initial }}</span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #04201c;
  font-weight: 700;
  line-height: 1;
  flex: none;
}
</style>
