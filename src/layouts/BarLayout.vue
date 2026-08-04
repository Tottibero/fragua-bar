<template>
  <div class="shell">
    <header class="topbar">
      <div class="topbar-brand">
        <img src="/logo.png" alt="" class="topbar-logo" />
        <span class="topbar-title">BAR - {{ route.meta.title as string }}</span>
      </div>
      <button class="logout-btn" @click="handleLogout" aria-label="Cerrar sesión">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </header>
    <div class="accent-line"></div>

    <main class="content">
      <slot />
    </main>

    <nav class="tabbar">
      <router-link to="/attendees" class="tab" active-class="tab-active">
        <svg width="21" height="21" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
        <span>Asistentes</span>
      </router-link>
      <router-link to="/consumptions" class="tab" active-class="tab-active">
        <svg width="21" height="21" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
        <span>Consumiciones</span>
      </router-link>
      <router-link to="/carta" class="tab" active-class="tab-active">
        <svg width="21" height="21" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h7a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
        <span>Carta</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.clearAuth()
  router.push('/login')
}
</script>

<style scoped>
.shell {
  height: 100svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  flex-shrink: 0;
  height: 56px;
  padding-top: env(safe-area-inset-top);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 8px rgba(var(--ink), 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 1rem;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.topbar-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: 18px;
  flex-shrink: 0;
}

.topbar-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-primary);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.logout-btn:hover {
  color: var(--danger);
  border-color: rgba(214, 79, 67, 0.3);
  background: var(--danger-bg);
}

.accent-line {
  height: 2px;
  flex-shrink: 0;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-glow) 35%, transparent 65%);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem calc(1rem + env(safe-area-inset-bottom));
}

.tabbar {
  flex-shrink: 0;
  display: flex;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
  box-shadow: 0 -1px 8px rgba(var(--ink), 0.04);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.55rem 0.25rem 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
  min-height: 56px;
}

.tab span {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.tab-active {
  color: var(--accent);
}
</style>
