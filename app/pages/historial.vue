<script setup lang="ts">
import type { HistoryAction } from '#shared/types/shopping'

const { entries, loading } = useListHistory()
const { members } = useListMembers()

const LABEL: Record<HistoryAction, string> = {
  'added': 'añadió',
  'removed': 'quitó',
  'bought': 'compró',
  'qty-changed': 'cambió la cantidad de',
}

function colorOf(uid: string) {
  return members.value.find((m) => m.uid === uid)?.color ?? '#d6d3d1'
}
</script>

<template>
  <div class="page">
    <h1>Historial</h1>
    <p class="muted">Quién ha tocado qué, lo más reciente primero.</p>

    <p v-if="loading" class="muted pad">Cargando…</p>
    <p v-else-if="!entries.length" class="muted pad">Todavía no hay movimientos.</p>

    <ul v-else class="entries">
      <li v-for="entry in entries" :key="entry.id" class="entry card">
        <AppAvatar :name="entry.byName" :color="colorOf(entry.byUid)" :size="30" />
        <div class="text">
          <p>
            <strong>{{ entry.byName || 'Alguien' }}</strong>
            {{ LABEL[entry.action] }}
            <strong>{{ entry.itemName }}</strong>
            <span v-if="entry.qty > 1" class="muted"> ×{{ entry.qty }}</span>
          </p>
          <p class="muted when">{{ relativeTime(entry.at) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1 {
  font-size: 30px;
}

h1 + p {
  margin: 6px 0 22px;
}

.pad {
  padding: 40px 0;
  text-align: center;
}

.entries {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.text p {
  margin: 0;
}

.when {
  font-size: 13px;
}
</style>
