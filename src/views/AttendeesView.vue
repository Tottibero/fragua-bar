<template>
  <BarLayout>
    <div class="header">
      <p v-if="eventName" class="event-name">{{ eventName }}</p>
      <p v-if="data" class="stats">
        <span class="stat-chip">👥 {{ data.nonMemberCount }} no socios</span>
        <span class="stat-chip green">{{ data.totalRevenue.toFixed(2) }} € recaudados</span>
      </p>
      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        <input v-model="searchQuery" class="search-input" placeholder="Buscar…" type="text" autocomplete="off" />
      </div>
    </div>

    <div v-if="loading" class="state-loading"><div class="loading-bar"></div></div>
    <div v-else-if="noActive" class="state-empty"><p>No hay evento activo</p></div>
    <div v-else-if="data && data.attendees.length === 0" class="state-empty"><p>Sin asistentes aún</p></div>
    <div v-else-if="filteredAttendees.length === 0" class="state-empty"><p>Sin resultados para "{{ searchQuery }}"</p></div>
    <div v-else class="attendee-list">
      <div v-for="a in filteredAttendees" :key="a.id" class="attendee-row">
        <div class="row-main">
          <span class="name">{{ a.nickname }}</span>
          <div class="row-sub">
            <span class="role-chip" :class="a.role === 'socio' ? 'socio' : 'usuario'">{{ a.role }}</span>
            <span v-if="a.payment" class="payment">{{ parseFloat(a.payment.amount).toFixed(2) }} €</span>
          </div>
        </div>
        <button v-if="a.role === 'usuario'" class="confirm-btn" :class="{ yes: a.confirmed, locked: !!a.payment }" @click="toggleConfirm(a)">
          {{ a.confirmed ? '✓ CONFIRMADO' : 'CONFIRMAR' }}
        </button>
        <span v-else class="muted">—</span>
      </div>
    </div>
  </BarLayout>

  <ConfirmDialog
    v-if="pendingConfirm"
    title="Registrar pago"
    :message="`¿Confirmas el pago de <strong>${pendingConfirm.nickname}</strong>? Se generará un cobro de <strong>${data?.price ?? 0} €</strong> que no se puede deshacer desde aquí.`"
    confirmLabel="REGISTRAR PAGO"
    @confirm="doPay"
    @cancel="pendingConfirm = null"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToastStore } from '@/stores/toast'
import { activeEventService } from '@/services/active-event.service'
import BarLayout from '@/layouts/BarLayout.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import type { AttendeesResponse, Attendee } from '@/types'

const toast = useToastStore()
const loading = ref(false)
const noActive = ref(false)
const data = ref<AttendeesResponse | null>(null)
const eventName = ref('')
const searchQuery = ref('')
const pendingConfirm = ref<Attendee | null>(null)

const filteredAttendees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q || !data.value) return data.value?.attendees ?? []
  return data.value.attendees.filter(a => a.nickname.toLowerCase().includes(q))
})

function err(e: unknown, fallback: string) {
  return axios.isAxiosError(e) ? (e.response?.data?.message ?? fallback) : fallback
}

async function load() {
  loading.value = true
  try {
    const [res, event] = await Promise.all([activeEventService.getAttendees(), activeEventService.getActive()])
    data.value = res
    eventName.value = event.name
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) noActive.value = true
    else toast.error(err(e, 'Error al cargar asistentes.'))
  } finally { loading.value = false }
}

function toggleConfirm(a: Attendee) {
  if (a.payment) return
  if (!a.confirmed) {
    pendingConfirm.value = a
  } else {
    applyConfirm(a, false)
  }
}

async function doPay() {
  const a = pendingConfirm.value!
  pendingConfirm.value = null
  await applyConfirm(a, true)
}

async function applyConfirm(a: Attendee, confirmed: boolean) {
  try {
    await activeEventService.updateAttendee(a.id, { confirmed })
    data.value = await activeEventService.getAttendees()
  } catch (e) { toast.error(err(e, 'Error al actualizar.')) }
}

onMounted(load)
</script>

<style scoped>
.header { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem; }
.event-name { font-family: 'Rajdhani', sans-serif; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
.stats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.stat-chip { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; padding: 0.2rem 0.55rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 2px; color: var(--text-secondary); }
.stat-chip.green { color: var(--success); border-color: rgba(95, 197, 147, 0.2); background: rgba(95, 197, 147, 0.06); }

.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 0.6rem; color: var(--text-muted); pointer-events: none; }
.search-input { width: 100%; padding: 0.7rem 0.75rem 0.7rem 2rem; background: var(--bg-elevated); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; color: var(--text-primary); font-size: 0.9rem; outline: none; }
.search-input:focus { border-color: var(--border-active); }

.state-loading { padding: 3rem; display: flex; justify-content: center; }
.loading-bar { width: 160px; height: 2px; background: var(--bg-hover); border-radius: 1px; overflow: hidden; position: relative; }
.loading-bar::after { content: ''; position: absolute; top: 0; left: -60%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: sweep 1.2s ease-in-out infinite; }
@keyframes sweep { to { left: 110%; } }
.state-empty { padding: 3rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.92rem; }

.attendee-list { display: flex; flex-direction: column; gap: 0.5rem; }
.attendee-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem 0.9rem; }
.row-main { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.name { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-sub { display: flex; align-items: center; gap: 0.5rem; }
.role-chip { display: inline-flex; padding: 0.14rem 0.45rem; border-radius: 2px; font-family: 'Rajdhani', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.role-chip.socio { color: #a78bfa; background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2); }
.role-chip.usuario { color: var(--text-secondary); background: var(--bg-hover); border: 1px solid var(--border); }
.payment { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--success); }
.muted { color: var(--text-muted); font-size: 0.85rem; flex-shrink: 0; }

.confirm-btn { flex-shrink: 0; min-height: 42px; padding: 0 0.9rem; border-radius: 4px; font-family: 'Rajdhani', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; border: 1px solid rgba(100,116,139,0.2); background: rgba(100,116,139,0.08); color: var(--text-muted); transition: all 0.15s; white-space: nowrap; }
.confirm-btn.yes { background: var(--success-bg); border-color: rgba(95, 197, 147, 0.25); color: var(--success); }
.confirm-btn.locked { opacity: 0.6; cursor: not-allowed; }
</style>
