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

<template>
  <div class="page">
    <header class="head">
      <h1>Historial</h1>
      <p class="page-sub">Compras terminadas por la familia</p>
    </header>

    <p v-if="loading" class="pad">Cargando…</p>
    <p v-else-if="!trips.length" class="pad">
      Todavía no hay ninguna compra terminada.
    </p>

    <ul v-else class="scroll">
      <li v-for="trip in trips" :key="trip.id" class="hist card">
        <button
          type="button"
          class="hist-head"
          :aria-expanded="open === trip.id"
          @click="toggle(trip.id)"
        >
          <AppAvatar :name="trip.byName" :color="colorOf(trip.byUid)" :size="38" />
          <span class="text">
            <span class="date">{{ tripDate(trip.at) }}</span>
            <span class="meta">
              {{ trip.byName || 'Alguien' }} ·
              {{ trip.items.length }} producto{{ trip.items.length === 1 ? '' : 's' }}
            </span>
          </span>
          <span class="toggle meta" aria-hidden="true">{{ open === trip.id ? '−' : '+' }}</span>
        </button>

        <div v-if="open === trip.id" class="hist-body">
          <div v-for="(line, index) in trip.items" :key="index" class="hist-line">
            <span>{{ line.name }}</span>
            <span class="meta line-qty">×{{ line.qty }}</span>
          </div>

          <button
            type="button"
            class="btn btn-teal repeat"
            :disabled="repeating === trip.id"
            @click="repeat(trip)"
          >
            {{ repeating === trip.id ? 'Añadiendo…' : 'Repetir esta compra' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page {
  max-width: var(--page-max);
  margin: 0 auto;
  padding-bottom: calc(var(--nav-h) + 24px);
}

.head {
  padding: 16px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pad {
  padding: 48px 24px;
  text-align: center;
  color: var(--meta);
}

.scroll {
  padding: 0 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hist {
  overflow: hidden;
}

.hist-head {
  width: 100%;
  text-align: left;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.text {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.date {
  font-size: 16px;
  font-weight: 500;
}

.toggle {
  flex: none;
  font-size: 18px;
  line-height: 1;
}

/* Las líneas se alinean con el texto de la cabecera, no con el avatar. */
.hist-body {
  padding: 0 18px 16px 70px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hist-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  color: #4e3557;
}

.line-qty {
  font-size: 15px;
}

.repeat {
  height: 47px;
  margin-top: 8px;
  font-size: 15px;
}
</style>
