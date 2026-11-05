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

<template>
  <div class="shell">
    <p v-if="loading" class="boot">Cargando la lista…</p>

    <NameGate v-else-if="!me" @join="join" />

    <template v-else>
      <slot />

      <AddItemBar v-if="isList" />

      <nav v-if="!fullscreen" class="nav">
        <div class="inner">
          <NuxtLink v-for="tab in TABS" :key="tab.to" :to="tab.to" class="tab">
            <span class="tab-pill">{{ tab.glyph }}</span>
            <span class="label">{{ tab.label }}</span>
          </NuxtLink>
        </div>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.boot {
  padding: 72px 24px;
  text-align: center;
  color: var(--muted);
}

.nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--track);
  padding-bottom: env(safe-area-inset-bottom);
}

.inner {
  max-width: var(--page-max);
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  padding: 8px 12px 10px;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  text-decoration: none;
  color: var(--ink);
  font-size: 12px;
}

.tab-pill {
  width: 56px;
  height: 30px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

/* La pestaña activa: píldora verde detrás del icono y etiqueta en negrita. */
.tab.router-link-exact-active .tab-pill {
  background: var(--mint);
}

.tab.router-link-exact-active .label {
  font-weight: 600;
}
</style>
