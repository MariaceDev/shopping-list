<template>
  <v-app>
    <!-- Crear una lista no depende de tener una abierta. -->
    <slot v-if="route.path === '/nueva'" />

    <!-- Sin enlace y sin lista guardada: se pide el enlace. -->
    <NoList v-else-if="!$listId" />

    <ListGate v-else>
      <slot />
    </ListGate>
  </v-app>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
