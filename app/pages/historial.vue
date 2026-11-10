<template>
  <div class="page page-hist mx-auto w-100">
    <header class="d-flex flex-column ga-1 px-6 pt-4 pb-5">
      <h1>Historial</h1>
      <p class="page-sub">Compras terminadasta</p>
    </header>

    <p v-if="loading" class="py-12 px-6 text-center text-meta">Cargando…</p>
    <p v-else-if="!trips.length" class="py-12 px-6 text-center text-meta">
      Todavía no hay ninguna compra terminada.
    </p>

    <ul v-else class="d-flex flex-column ga-2 px-4 pb-3">
      <v-card v-for="trip in trips" :key="trip.id" tag="li">
        <button
          type="button"
          class="hist-head d-flex align-center w-100 text-left"
          :aria-expanded="open === trip.id"
          @click="toggle(trip.id)"
        >
          <AppAvatar :name="nameOf(trip)" :color="colorOf(trip.byUid)" :size="38" />
          <span class="hist-text d-flex flex-column flex-1-1-0 min-w-0">
            <span class="hist-date font-weight-medium">{{ tripDate(trip.at) }}</span>
            <span class="meta">
              {{ nameOf(trip) || 'Alguien' }} ·
              {{ trip.items.length }} producto{{ trip.items.length === 1 ? '' : 's' }}
            </span>
          </span>
          <span v-if="trip.total !== null" class="hist-total flex-shrink-0">
            {{ formatAmount(trip.total) }}
          </span>
          <v-icon
            :icon="open === trip.id ? 'mdi-minus' : 'mdi-plus'"
            :size="20"
            class="meta flex-shrink-0"
          />
        </button>

        <!-- Las líneas se alinean con el texto de la cabecera, no con el avatar. -->
        <div v-if="open === trip.id" class="hist-body d-flex flex-column ga-2">
          <div v-for="(line, index) in trip.items" :key="index" class="hist-line d-flex justify-space-between ga-3">
            <span>{{ line.name }}</span>
            <span class="meta hist-qty">×{{ line.qty }}</span>
          </div>

          <label class="hist-line hist-price d-flex align-center ga-3 mt-1">
            <span class="flex-shrink-0">Total</span>
            <!-- Parece un campo de texto: al tocarlo se abre la hoja del importe. -->
            <button
              type="button"
              class="hist-price-field d-flex align-center ga-2 flex-1-1-0 min-w-0 text-left"
              :class="{ 'hist-price-empty': trip.total === null }"
              :aria-label="trip.total === null ? 'Apuntar lo que costó' : 'Cambiar lo que costó'"
              @click="editTotal(trip)"
            >
              <span class="flex-1-1-0 text-truncate">
                {{ trip.total === null ? '0,00 €' : formatAmount(trip.total) }}
              </span>
              <v-icon icon="mdi-pencil-outline" :size="18" class="flex-shrink-0" />
            </button>
          </label>

          <v-btn
            color="primary"
            :height="47"
            class="hist-repeat w-100 mt-2"
            :disabled="repeating === trip.id"
            @click="repeat(trip)"
          >
            {{ repeating === trip.id ? 'Añadiendo…' : 'Repetir esta compra' }}
          </v-btn>
        </div>
      </v-card>
    </ul>

    <TripTotalSheet v-model="pricing" :trip="pricedTrip" />
  </div>
</template>

<script setup lang="ts">
import type { ShoppingTrip } from '#shared/types/ShoppingTrip.type'
import { formatAmount } from '#shared/utils/money'

const { trips, loading } = storeToRefs(useTripsStore())
const { members } = storeToRefs(useMembersStore())
const { repeatTrip } = useShoppingListStore()

// Todas las compras empiezan plegadas: se abren al tocarlas.
const open = ref<string | null>(null)
const repeating = ref('')

function toggle(id: string) {
  open.value = open.value === id ? null : id
}

/** El nombre de ahora, si sigue en la lista; si no, el de aquel día. */
function nameOf(trip: ShoppingTrip) {
  return members.value.find((m) => m.uid === trip.byUid)?.name ?? trip.byName
}

function colorOf(uid: string) {
  return members.value.find((m) => m.uid === uid)?.color ?? '#d6d3d1'
}

// La compra a la que se le está apuntando el precio. Se guarda el id, no la
// compra, para que la hoja vea los cambios que lleguen de Firestore.
const pricing = ref(false)
const pricedId = ref('')
const pricedTrip = computed(() => trips.value.find((t) => t.id === pricedId.value) ?? null)

function editTotal(trip: ShoppingTrip) {
  pricedId.value = trip.id
  pricing.value = true
}

async function repeat(trip: ShoppingTrip) {
  if (repeating.value) return
  repeating.value = trip.id
  try {
    await repeatTrip(trip)
    await navigateTo('/')
  } finally {
    repeating.value = ''
  }
}
</script>
