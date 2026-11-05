<script setup lang="ts">
const { me, loading, join } = useListMembers()
</script>

<template>
  <div class="shell">
    <p v-if="loading" class="boot muted">Cargando la lista…</p>

    <NameGate v-else-if="!me" @join="join" />

    <template v-else>
      <slot />

      <nav class="nav">
        <NuxtLink to="/">
          <span class="icon">☰</span>
          <span>Lista</span>
        </NuxtLink>
        <NuxtLink to="/historial">
          <span class="icon">↺</span>
          <span>Historial</span>
        </NuxtLink>
        <NuxtLink to="/nfc">
          <span class="icon">NFC</span>
          <span>Tag NFC</span>
        </NuxtLink>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.boot {
  padding: 72px 24px;
  text-align: center;
}

.nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--nav-h);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  max-width: 560px;
  margin: 0 auto;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav a {
  display: grid;
  justify-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-soft);
  font-size: 12px;
  padding: 8px 0;
}

.nav a.router-link-exact-active {
  color: var(--text);
  font-weight: 600;
}

.icon {
  font-size: 15px;
  line-height: 1.4;
}

.nav a.router-link-exact-active .icon {
  background: #d9f99d;
  border-radius: 999px;
  padding: 2px 14px;
}
</style>
