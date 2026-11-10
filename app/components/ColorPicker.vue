<template>
  <!-- Los colores de la paleta en círculos. El elegido lleva aro y tu inicial. -->
  <div class="d-flex ga-3" role="radiogroup" aria-label="Tu color">
    <button
      v-for="swatch in MEMBER_COLORS"
      :key="swatch"
      type="button"
      role="radio"
      :aria-checked="swatch === color"
      :aria-label="`Color ${swatch}`"
      class="swatch d-flex align-center justify-center rounded-circle"
      :class="{ 'swatch-on': swatch === color }"
      :style="{ background: swatch, color: inkFor(swatch) }"
      @click="color = swatch"
    >
      <span v-if="swatch === color" class="swatch-initial initial">{{ initialOf(name) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { MEMBER_COLORS, initialOf, inkFor } from '#shared/utils/members'

const color = defineModel<string>({ required: true })
defineProps<{ name: string }>()
</script>
