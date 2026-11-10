<template>
  <v-bottom-sheet v-model="open" :max-width="520">
    <form class="sheet d-flex flex-column ga-6" @submit.prevent="save(amount)">
      <div class="d-flex flex-column ga-2">
        <p class="eyebrow text-primary">{{ trip ? tripDate(trip.at) : 'Compra' }}</p>
        <h2 class="h-sheet">¿Cuánto costó?</h2>
      </div>

      <v-text-field
        v-model="text"
        class="name-field total-field"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0,00"
        suffix="€"
        aria-label="Lo que costó, en euros"
        autofocus
      />

      <p v-if="invalid" class="text-error">Escribe el importe con números, por ejemplo 23,45.</p>
      <p v-else-if="error" class="text-error">{{ error }}</p>

      <div class="d-flex flex-column ga-2">
        <v-btn
          type="submit"
          color="primary"
          :height="56"
          class="w-100"
          :disabled="amount === null || amount === trip?.total || saving"
        >
          Guardar
        </v-btn>
        <v-btn
          v-if="trip?.total !== null"
          variant="text"
          :height="44"
          class="w-100"
          :disabled="saving"
          @click="save(null)"
        >
          Quitar el precio
        </v-btn>
      </div>
    </form>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import type { ShoppingTrip } from '#shared/types/ShoppingTrip.type'
import { parseAmount } from '#shared/utils/money'

const open = defineModel<boolean>({ required: true })
const props = defineProps<{ trip: ShoppingTrip | null }>()

const { setTotal } = useTripsStore()

const text = ref('')
const saving = ref(false)
const error = ref('')

const amount = computed(() => parseAmount(text.value))
/** Solo se avisa cuando ya hay algo escrito que no vale. */
const invalid = computed(() => text.value.trim() !== '' && amount.value === null)

// Cada vez que se abre, parte de lo que hay apuntado.
watch(open, (isOpen) => {
  if (!isOpen) return
  const total = props.trip?.total
  text.value = total == null ? '' : total.toFixed(2).replace('.', ',')
  error.value = ''
}, { immediate: true })

async function save(total: number | null) {
  if (!props.trip || saving.value) return
  if (total !== null && total === props.trip.total) return
  saving.value = true
  error.value = ''
  try {
    await setTotal(props.trip.id, total)
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se ha podido guardar'
  } finally {
    saving.value = false
  }
}
</script>
