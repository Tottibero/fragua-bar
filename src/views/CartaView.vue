<template>
  <BarLayout>
    <div class="header">
      <p v-if="eventName" class="event-name">{{ eventName }}</p>
    </div>

    <div v-if="loading" class="state-loading"><div class="loading-bar"></div></div>
    <div v-else-if="noActive" class="state-empty"><p>No hay evento activo</p></div>
    <div v-else-if="eventDrinks.length === 0" class="state-empty"><p>Sin bebidas en la carta</p></div>
    <div v-else class="drink-list">
      <div v-for="ed in eventDrinks" :key="ed.id" class="drink-row">
        <div class="row-main">
          <span class="name">{{ ed.drink?.name ?? '—' }}</span>
          <span class="price">{{ parseFloat(ed.price).toFixed(2) }} €</span>
        </div>
        <button class="avail-btn" :class="{ yes: ed.available }" @click="toggleAvail(ed)">
          {{ ed.available ? '✓ DISPONIBLE' : '✗ AGOTADA' }}
        </button>
      </div>
    </div>
  </BarLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToastStore } from '@/stores/toast'
import { activeEventService } from '@/services/active-event.service'
import BarLayout from '@/layouts/BarLayout.vue'
import type { EventDrink } from '@/types'

const toast = useToastStore()
const loading = ref(false)
const noActive = ref(false)
const eventDrinks = ref<EventDrink[]>([])
const eventName = ref('')

function err(e: unknown, msg: string) { return axios.isAxiosError(e) ? (e.response?.data?.message ?? msg) : msg }

async function load() {
  loading.value = true
  try {
    const [eds, event] = await Promise.all([
      activeEventService.getEventDrinks(),
      activeEventService.getActive(),
    ])
    eventDrinks.value = eds
    eventName.value = event.name
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) noActive.value = true
    else toast.error(err(e, 'Error al cargar carta.'))
  } finally { loading.value = false }
}

async function toggleAvail(ed: EventDrink) {
  try {
    await activeEventService.updateEventDrink(ed.id, { available: !ed.available })
    eventDrinks.value = await activeEventService.getEventDrinks()
  } catch (e) { toast.error(err(e, 'Error al actualizar.')) }
}

onMounted(load)
</script>

<style scoped>
.header { margin-bottom: 1rem; }
.event-name { font-family: 'Fredoka', sans-serif; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }

.state-loading { padding: 3rem; display: flex; justify-content: center; }
.loading-bar { width: 160px; height: 2px; background: var(--bg-hover); border-radius: 1px; overflow: hidden; position: relative; }
.loading-bar::after { content: ''; position: absolute; top: 0; left: -60%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: sweep 1.2s ease-in-out infinite; }
@keyframes sweep { to { left: 110%; } }
.state-empty { padding: 3rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.92rem; }

.drink-list { display: flex; flex-direction: column; gap: 0.5rem; }
.drink-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px; padding: 0.75rem 0.9rem; }
.row-main { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
.name { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.price { font-family: 'Fredoka', sans-serif; font-size: 0.8rem; color: var(--accent); }

.avail-btn { flex-shrink: 0; min-height: 48px; padding: 0 0.9rem; border-radius: 16px; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; border: 1px solid rgba(100,116,139,0.2); background: rgba(100,116,139,0.08); color: var(--text-muted); transition: all 0.15s; white-space: nowrap; }
.avail-btn.yes { background: var(--success-bg); border-color: rgba(95, 197, 147, 0.25); color: var(--success); }
</style>
