<script setup lang="ts">
import { computed } from 'vue'
import {
  failedMutationCount,
  flushMutationQueue,
  isOnline,
  isSynchronizing,
  pendingMutationCount,
} from '@/services/sync-queue.service'

const label = computed(() => {
  if (failedMutationCount.value) return `${failedMutationCount.value} operación pendiente de revisar`
  if (isSynchronizing.value) return 'Sincronizando…'
  if (pendingMutationCount.value) return `${pendingMutationCount.value} pendiente${pendingMutationCount.value === 1 ? '' : 's'} de sincronizar`
  return isOnline.value ? 'Sincronizado' : 'Sin conexión'
})

const statusClass = computed(() => ({
  'sync-status--error': failedMutationCount.value > 0,
  'sync-status--pending': !failedMutationCount.value && (isSynchronizing.value || pendingMutationCount.value > 0),
  'sync-status--offline': !isOnline.value,
}))
</script>

<template>
  <button class="sync-status" :class="statusClass" type="button" :title="label" @click="flushMutationQueue">
    <svg class="sync-status-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.5 7.5A6.5 6.5 0 0 0 4.3 6M3.5 3.5v3h3M3.5 12.5A6.5 6.5 0 0 0 15.7 14m.8 2.5v-3h-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
    <span class="sync-status-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.sync-status { display: inline-flex; align-items: center; gap: .3rem; min-height: 30px; padding: .3rem .45rem; border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--text-muted); cursor: pointer; font-size: .68rem; font-weight: 600; letter-spacing: .02em; transition: background .15s, color .15s; }
.sync-status:hover { background: var(--bg-hover); color: var(--text-secondary); }.sync-status-icon { width: 15px; height: 15px; flex: none; }.sync-status--pending { color: var(--gold); }.sync-status--error { color: var(--danger); }.sync-status--offline { color: var(--text-muted); }.sync-status--pending .sync-status-icon { animation: spin 1.1s linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }@media (max-width: 520px) { .sync-status-label { display: none; } .sync-status { padding: .4rem; } }
</style>
