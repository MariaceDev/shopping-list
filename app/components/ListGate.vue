<template>
  <!-- Ya hay lista abierta: falta ser miembro (NameGate) y luego la app. -->
  <p v-if="loading" class="boot text-center text-muted">Cargando la lista…</p>

  <NameGate v-else-if="!me" />

  <template v-else>
    <slot />

    <AddItemBar v-if="isList" />

    <nav v-if="!fullscreen" class="nav position-fixed left-0 right-0 bottom-0 bg-track border-t">
      <div class="nav-inner d-flex justify-space-around mx-auto">
        <!-- Solo iconos: la pestaña activa va en teal y el resto en gris. -->
        <v-btn
          v-for="tab in TABS"
          :key="tab.to"
          :to="tab.to"
          exact
          variant="text"
          :width="72"
          :height="56"
          class="tab"
          :aria-label="tab.label"
        >
          <!-- Dibujo a mano como máscara: el color lo pone la pestaña (teal o gris). -->
          <span class="tab-icon" :style="{ '--tab-icon': `url(${tab.icon})` }" aria-hidden="true" />
        </v-btn>
      </div>
    </nav>
  </template>
</template>

<script setup lang="ts">
const route = useRoute()
// Solo aquí, con una lista abierta, se puede usar el store de miembros.
const { me, loading } = storeToRefs(useMembersStore())

const TABS = [
  { to: '/', icon: '/icons/lista.png', label: 'Lista' },
  { to: '/historial', icon: '/icons/historial.png', label: 'Historial' },
  { to: '/comprar', icon: '/icons/comprar.png', label: 'Comprar' },
]

/** El modo tienda ocupa la pantalla entera: sin navegación ni buscador. */
const fullscreen = computed(() => route.path === '/comprar')
const isList = computed(() => route.path === '/')
</script>
