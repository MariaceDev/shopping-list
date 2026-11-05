<template>
  <v-app>
    <p v-if="loading" class="boot text-center text-muted">Cargando la lista…</p>

    <NameGate v-else-if="!me" @join="join" />

    <template v-else>
      <slot />

      <AddItemBar v-if="isList" />

      <nav v-if="!fullscreen" class="nav position-fixed left-0 right-0 bottom-0 bg-track">
        <div class="nav-inner d-flex justify-space-around mx-auto">
          <!-- La pestaña activa: píldora verde detrás del icono y etiqueta en negrita. -->
          <v-btn
            v-for="tab in TABS"
            :key="tab.to"
            :to="tab.to"
            exact
            variant="text"
            height="auto"
            class="tab"
          >
            <span class="d-flex flex-column align-center ga-1">
              <span class="tab-pill d-flex align-center justify-center rounded-pill">{{ tab.glyph }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </span>
          </v-btn>
        </div>
      </nav>
    </template>
  </v-app>
</template>

<script setup lang="ts">
const route = useRoute()
const { me, loading, join } = useListMembers()

const TABS = [
  { to: '/', glyph: '≡', label: 'Lista' },
  { to: '/historial', glyph: '↺', label: 'Historial' },
  { to: '/nfc', glyph: 'NFC', label: 'Tag NFC' },
]

/** El modo tienda ocupa la pantalla entera: sin navegación ni buscador. */
const fullscreen = computed(() => route.path === '/comprar')
const isList = computed(() => route.path === '/')
</script>
