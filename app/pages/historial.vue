<template>
  <div class="page page-hist mx-auto w-100">
    <header class="d-flex flex-column ga-1 px-6 pt-4 pb-5">
      <h1>Historial</h1>
      <p class="page-sub">Compras terminadas por la familia</p>
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
          <AppAvatar :name="trip.byName" :color="colorOf(trip.byUid)" :size="38" />
          <span class="hist-text d-flex flex-column flex-1-1-0 min-w-0">
            <span class="hist-date font-weight-medium">{{ tripDate(trip.at) }}</span>
            <span class="meta">
              {{ trip.byName || 'Alguien' }} ·
              {{ trip.items.length }} producto{{ trip.items.length === 1 ? '' : 's' }}
            </span>
          </span>
          <span class="hist-toggle meta flex-shrink-0" aria-hidden="true">{{ open === trip.id ? '−' : '+' }}</span>
        </button>

        <!-- Las líneas se alinean con el texto de la cabecera, no con el avatar. -->
        <div v-if="open === trip.id" class="hist-body d-flex flex-column ga-2">
          <div v-for="(line, index) in trip.items" :key="index" class="hist-line d-flex justify-space-between ga-3">
            <span>{{ line.name }}</span>
            <span class="meta hist-qty">×{{ line.qty }}</span>
          </div>

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
  </div>
</template>

<script setup lang="ts">
import type { ShoppingTrip } from '#shared/types/shopping'

const { trips, loading } = useTrips()
const { members } = useListMembers()
const { repeatTrip } = useShoppingList()

const open = ref<string | null>(null)
const touched = ref(false)
const repeating = ref('')

// El prototipo abre la compra más reciente, hasta que tocas tú.
watch(
  trips,
  (list) => {
    if (!touched.value && list.length) open.value = list[0]!.id
  },
  { immediate: true },
)

function toggle(id: string) {
  touched.value = true
  open.value = open.value === id ? null : id
}

function colorOf(uid: string) {
  return members.value.find((m) => m.uid === uid)?.color ?? '#d6d3d1'
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
