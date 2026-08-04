<template>
  <BarLayout>
    <div class="page-header flex flex-col gap-3 mb-5">
      <div>
        <div class="title-line">
          <p v-if="eventName" class="event-name-label">{{ eventName }}</p>
        </div>
      </div>
      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        <input v-model="searchQuery" class="search-input" placeholder="Buscar asistente…" type="text" autocomplete="off"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
        />
        <ul v-if="showSuggestions && suggestions.length" class="suggestions-list">
          <li v-for="name in suggestions" :key="name" class="suggestion-item" @mousedown.prevent="selectSuggestion(name)">{{ name }}</li>
        </ul>
      </div>
    </div>

    <div v-if="loading" class="state-loading"><div class="loading-bar"></div></div>
    <div v-else-if="noActive" class="state-empty">
      <p>No hay evento activo</p>
    </div>
    <div v-else-if="attendees.length === 0" class="state-empty"><p>Sin asistentes</p></div>
    <template v-else>
      <div v-if="filteredSummary.length === 0" class="state-empty"><p>Sin resultados para "{{ searchQuery }}"</p></div>
      <div v-else class="card-grid">
      <div v-for="row in filteredSummary" :key="row.attendeeId" class="attendee-card">
        <div class="card-header">
          <span class="card-name">{{ row.nickname }}</span>
          <span v-if="freeConsumption" :class="['free-tag', row.freeUsed ? 'free-tag--used' : 'free-tag--pending']">
            {{ row.freeUsed ? '★ GRATIS' : '○ GRATIS' }}
          </span>
        </div>

        <div class="card-stats">
          <div class="stat-block">
            <span class="stat-val mono">{{ row.totalConsumed.toFixed(2) }} €</span>
            <span class="stat-label">CONSUMIDO</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-block">
            <span class="stat-val mono green">{{ row.totalPaid.toFixed(2) }} €</span>
            <span class="stat-label">PAGADO</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-block">
            <span v-if="row.pending > 0.001" class="stat-val mono amber">{{ row.pending.toFixed(2) }} €</span>
            <span v-else class="stat-val al-dia">✓ AL DÍA</span>
            <span class="stat-label">PENDIENTE</span>
          </div>
        </div>

        <div class="card-actions">
          <button v-if="freeConsumption && !row.freeUsed" class="action-btn btn-canjear" @click="toggle(row.attendeeId, 'canjear')">CANJEAR</button>
          <button class="action-btn btn-add" @click="toggle(row.attendeeId, 'add')">+ AÑADIR</button>
          <button v-if="row.pending > 0.001" class="action-btn btn-pay" @click="toggle(row.attendeeId, 'pay', row)">COBRAR</button>
          <button v-if="row.hasConsumptions" class="action-btn btn-summary" @click="toggle(row.attendeeId, 'resumen')">RESUMEN</button>
        </div>
      </div>
      </div>
    </template>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="activeAttendeeId && activeAction" class="modal-backdrop" @click.self="closeModal">
          <div class="modal" role="dialog">

            <div class="modal-header">
              <div class="modal-header-info">
                <span class="modal-name">{{ activeRow?.nickname }}</span>
                <span v-if="activeAction === 'canjear'" class="modal-sub">Consumición gratuita</span>
                <span v-else-if="activeAction === 'add'" class="modal-sub">Añadir consumición</span>
                <span v-else-if="activeAction === 'pay'" class="modal-sub amber">{{ activeRow?.pending.toFixed(2) }} € pendiente</span>
                <span v-else-if="activeAction === 'resumen'" class="modal-sub">Detalle de consumiciones</span>
              </div>
              <button class="modal-close" @click="closeModal">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </button>
            </div>

            <!-- Canjear -->
            <div v-if="activeAction === 'canjear'" class="modal-body">
              <p class="field-label">SELECCIONA LA BEBIDA</p>
              <div class="select-wrap">
                <select v-model="canjearDrinkId" class="fi-select">
                  <option value="">— Selecciona una bebida —</option>
                  <option v-for="ed in availableDrinks" :key="ed.id" :value="ed.id">{{ ed.drink?.name ?? '—' }}</option>
                </select>
                <svg class="sel-arr" width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </div>
              <button class="confirm-btn" @click="confirmCanjear" :disabled="!canjearDrinkId">CONFIRMAR CANJE GRATIS</button>
            </div>

            <!-- Añadir -->
            <div v-else-if="activeAction === 'add'" class="modal-body">
              <p class="field-label">SELECCIONA LA BEBIDA</p>
              <div class="select-wrap">
                <select v-model="addForm.eventDrinkId" class="fi-select">
                  <option value="">— Selecciona una bebida —</option>
                  <option v-for="ed in availableDrinks" :key="ed.id" :value="ed.id">
                    {{ ed.drink?.name ?? '—' }} — {{ parseFloat(ed.price).toFixed(2) }} €
                  </option>
                </select>
                <svg class="sel-arr" width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </div>
              <p class="field-label" style="margin-top: 0.25rem">CANTIDAD</p>
              <div class="qty-control">
                <button class="qty-btn" @click="addForm.quantity = Math.max(1, addForm.quantity - 1)">−</button>
                <span class="qty-val">{{ addForm.quantity }}</span>
                <button class="qty-btn" @click="addForm.quantity++">+</button>
              </div>
              <div v-if="addForm.eventDrinkId" class="add-subtotal">
                {{ (addForm.quantity * drinkPrice(addForm.eventDrinkId)).toFixed(2) }} €
              </div>
              <button class="confirm-btn" @click="confirmAdd" :disabled="!addForm.eventDrinkId">AÑADIR CONSUMICIÓN</button>
            </div>

            <!-- Cobrar -->
            <div v-else-if="activeAction === 'pay'" class="modal-body">
              <p class="field-label">IMPORTE A COBRAR (€)</p>
              <input v-model.number="payAmount" type="number" min="0.01" :max="activeRow?.pending" step="0.01" class="fi-input fi-input--lg" />
              <button class="confirm-btn confirm-btn--pay" @click="confirmPay" :disabled="!payAmount || payAmount <= 0">CONFIRMAR COBRO</button>
            </div>

            <!-- Resumen -->
            <div v-else-if="activeAction === 'resumen'" class="modal-body">
              <div v-if="activeResumen.length === 0" class="resumen-empty">Sin consumiciones registradas</div>
              <template v-else>
                <div v-for="line in activeResumen" :key="`${line.eventDrinkId}-${line.isFree}`" class="resumen-line">
                  <div class="resumen-left">
                    <span class="resumen-drink">{{ line.drinkName }}</span>
                    <span v-if="line.isFree" class="free-badge">GRATIS</span>
                  </div>
                  <div class="resumen-right">
                    <span class="resumen-qty">× {{ line.quantity }}</span>
                    <span v-if="line.isFree" class="resumen-price green">0.00 €</span>
                    <span v-else class="resumen-price amber">{{ line.subtotal.toFixed(2) }} €</span>
                  </div>
                </div>
                <div class="resumen-total">
                  <span>TOTAL</span>
                  <span class="mono amber">{{ activeRow?.totalConsumed.toFixed(2) }} €</span>
                </div>
              </template>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </BarLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useToastStore } from '@/stores/toast'
import { activeEventService } from '@/services/active-event.service'
import { paymentsService } from '@/services/payments.service'
import BarLayout from '@/layouts/BarLayout.vue'
import type { ConsumptionsResponse, Attendee } from '@/types'

const toast = useToastStore()
const loading = ref(false)
const noActive = ref(false)
const data = ref<ConsumptionsResponse | null>(null)
const attendees = ref<Attendee[]>([])
const eventId = ref<string>('')
const freeConsumption = ref(true)
const eventName = ref('')
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return summary.value.map(r => r.nickname).filter(n => n.toLowerCase().includes(q)).slice(0, 8)
})
const filteredSummary = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return summary.value
  return summary.value.filter(r => r.nickname.toLowerCase().includes(q))
})
function selectSuggestion(name: string) {
  searchQuery.value = name
  showSuggestions.value = false
}
function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}
const activeAttendeeId = ref<string | null>(null)
const activeAction = ref<'canjear' | 'add' | 'pay' | 'resumen' | null>(null)
const canjearDrinkId = ref('')
const addForm = reactive({ eventDrinkId: '', quantity: 1 })
const payAmount = ref(0)

function err(e: unknown, msg: string) { return axios.isAxiosError(e) ? (e.response?.data?.message ?? msg) : msg }

const availableDrinks = computed(() => data.value?.eventDrinks.filter(d => d.available) ?? [])

const summary = computed(() => {
  if (!attendees.value.length) return []
  const drinkMap = new Map((data.value?.eventDrinks ?? []).map(ed => [ed.id, ed]))
  const paidByUser = new Map<string, number>()
  for (const p of (data.value?.payments ?? [])) {
    paidByUser.set(p.userId, (paidByUser.get(p.userId) ?? 0) + parseFloat(p.amount))
  }
  const consumedByAttendee = new Map<string, number>()
  const attendeesWithConsumptions = new Set<string>()
  for (const c of (data.value?.consumptions ?? [])) {
    attendeesWithConsumptions.add(c.attendeeId)
    if (c.isFree) continue
    const price = parseFloat(drinkMap.get(c.eventDrinkId)?.price ?? '0')
    consumedByAttendee.set(c.attendeeId, (consumedByAttendee.get(c.attendeeId) ?? 0) + c.quantity * price)
  }
  return attendees.value.filter(a => a.role === 'socio' || a.payment !== null).map(a => {
    const totalConsumed = consumedByAttendee.get(a.id) ?? 0
    const totalPaid = paidByUser.get(a.userId) ?? 0
    return {
      attendeeId: a.id,
      userId: a.userId,
      nickname: a.nickname,
      totalConsumed,
      totalPaid,
      pending: Math.max(0, totalConsumed - totalPaid),
      freeUsed: a.freeConsumptionUsed,
      hasConsumptions: attendeesWithConsumptions.has(a.id),
    }
  })
})

const activeRow = computed(() => summary.value.find(r => r.attendeeId === activeAttendeeId.value) ?? null)

const activeResumen = computed(() => {
  if (!data.value || !activeAttendeeId.value) return []
  const drinkMap = new Map(data.value.eventDrinks.map(ed => [ed.id, ed]))
  return data.value.consumptions
    .filter(c => c.attendeeId === activeAttendeeId.value)
    .map(c => {
      const ed = drinkMap.get(c.eventDrinkId)
      const unitPrice = parseFloat(ed?.price ?? '0')
      return {
        eventDrinkId: c.eventDrinkId,
        drinkName: ed?.drink?.name ?? '—',
        quantity: c.quantity,
        unitPrice,
        subtotal: c.quantity * unitPrice,
        isFree: c.isFree,
      }
    })
})

function drinkPrice(eventDrinkId: string) {
  const ed = data.value?.eventDrinks.find(d => d.id === eventDrinkId)
  return parseFloat(ed?.price ?? '0')
}

async function load() {
  loading.value = true
  try {
    const [cons, att, event] = await Promise.all([
      activeEventService.getConsumptions(),
      activeEventService.getAttendees(),
      activeEventService.getActive(),
    ])
    data.value = cons
    attendees.value = att.attendees
    eventId.value = event.id
    eventName.value = event.name
    freeConsumption.value = event.freeConsumption
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) noActive.value = true
    else toast.error(err(e, 'Error al cargar consumiciones.'))
  } finally { loading.value = false }
}

function isActive(attendeeId: string, action: typeof activeAction.value) {
  return activeAttendeeId.value === attendeeId && activeAction.value === action
}

function toggle(attendeeId: string, action: 'canjear' | 'add' | 'pay' | 'resumen', row?: { pending: number }) {
  if (isActive(attendeeId, action)) { closeModal(); return }
  activeAttendeeId.value = attendeeId
  activeAction.value = action
  if (action === 'canjear') canjearDrinkId.value = ''
  if (action === 'add') Object.assign(addForm, { eventDrinkId: '', quantity: 1 })
  if (action === 'pay' && row) payAmount.value = Math.round(row.pending * 100) / 100
}

function closeModal() {
  activeAttendeeId.value = null
  activeAction.value = null
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

async function confirmCanjear() {
  if (!canjearDrinkId.value || !activeAttendeeId.value) return
  try {
    await activeEventService.addConsumption({ attendeeId: activeAttendeeId.value, eventDrinkId: canjearDrinkId.value, quantity: 1, isFree: true })
    closeModal()
    await load()
    toast.success('Consumición gratuita canjeada.')
  } catch (e) { toast.error(err(e, 'Error al canjear.')) }
}

async function confirmAdd() {
  if (!addForm.eventDrinkId || !activeAttendeeId.value) return
  try {
    await activeEventService.addConsumption({ attendeeId: activeAttendeeId.value, eventDrinkId: addForm.eventDrinkId, quantity: addForm.quantity })
    closeModal()
    data.value = await activeEventService.getConsumptions()
    toast.success('Consumición añadida.')
  } catch (e) { toast.error(err(e, 'Error al añadir.')) }
}

async function confirmPay() {
  if (!activeRow.value || !payAmount.value || payAmount.value <= 0) return
  try {
    await paymentsService.create({
      userId: activeRow.value.userId,
      type: 'consumption',
      eventId: eventId.value,
      amount: payAmount.value,
      paidAt: new Date().toISOString().slice(0, 10),
    })
    const nickname = activeRow.value.nickname
    closeModal()
    data.value = await activeEventService.getConsumptions()
    toast.success(`Pago de ${payAmount.value.toFixed(2)} € registrado para ${nickname}.`)
  } catch (e) { toast.error(err(e, 'Error al registrar pago.')) }
}

onMounted(() => { load(); window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.page-header { }
.title-line { display: flex; align-items: baseline; gap: 0.5rem; }
.event-name-label { font-family: 'Rajdhani', sans-serif; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
.search-wrap { position: relative; display: flex; align-items: center; width: 100%; }
.search-icon { position: absolute; left: 0.55rem; color: var(--text-muted); pointer-events: none; flex-shrink: 0; }
.search-input { padding: 0.7rem 0.75rem 0.7rem 1.9rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px; color: var(--text-primary); font-size: 0.9rem; font-family: inherit; outline: none; width: 100%; transition: border-color 0.15s; }
.search-input:focus { border-color: var(--border-active); }
.search-input::placeholder { color: var(--text-muted); }
.suggestions-list { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-elevated); border: 1px solid var(--border-mid); border-top: none; border-radius: 0 0 12px 12px; z-index: 50; max-height: 220px; overflow-y: auto; margin: 0; padding: 0.25rem 0; list-style: none; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.suggestion-item { padding: 0.45rem 0.75rem; font-size: 0.83rem; color: var(--text-secondary); cursor: pointer; transition: background 0.1s, color 0.1s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.suggestion-item:hover { background: var(--bg-hover); color: var(--accent); }

.state-loading { padding: 4rem; display: flex; justify-content: center; }
.loading-bar { width: 160px; height: 2px; background: var(--bg-hover); border-radius: 1px; overflow: hidden; position: relative; }
.loading-bar::after { content: ''; position: absolute; top: 0; left: -60%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: sweep 1.2s ease-in-out infinite; }
@keyframes sweep { to { left: 110%; } }
.state-empty { padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; text-align: center; }
.state-empty p { font-size: 0.95rem; color: var(--text-secondary); }

/* Grid */
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem; }

/* Card */
.attendee-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.1rem; display: flex; flex-direction: column; gap: 1rem; }

.card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.card-name { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
.free-tag { font-family: 'Rajdhani', sans-serif; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.08em; padding: 0.25rem 0.55rem; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
.free-tag--used { color: var(--success); background: var(--success-bg); border: 1px solid rgba(95, 197, 147, 0.2); }
.free-tag--pending { color: var(--gold); background: var(--gold-glow); border: 1px solid rgba(217, 165, 68, 0.18); opacity: 0.75; }

.card-stats { display: flex; align-items: stretch; background: var(--bg-elevated); border-radius: 16px; overflow: hidden; }
.stat-block { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.7rem 0.4rem; }
.stat-sep { width: 1px; background: var(--border); flex-shrink: 0; }
.stat-val { font-family: 'JetBrains Mono', monospace; font-size: 0.92rem; font-weight: 600; }
.stat-label { font-family: 'Rajdhani', sans-serif; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.09em; color: var(--text-muted); }
.al-dia { font-family: 'Rajdhani', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; color: var(--success); }
.green { color: var(--success); }
.amber { color: var(--accent); }
.mono { font-family: 'JetBrains Mono', monospace; }

.card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.action-btn { flex: 1; min-width: 72px; min-height: 46px; padding: 0.6rem 0.5rem; border-radius: 16px; font-family: 'Rajdhani', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.07em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; border: 1px solid transparent; }
.btn-canjear { background: var(--gold-glow); border-color: rgba(217, 165, 68, 0.2); color: var(--gold); }
.btn-canjear:hover { background: rgba(217, 165, 68, 0.2); border-color: rgba(217, 165, 68, 0.4); }
.btn-add { background: var(--bg-hover); border-color: var(--border); color: var(--text-secondary); }
.btn-add:hover { background: var(--border); color: var(--text-primary); }
.btn-pay { background: var(--success-bg); border-color: rgba(95, 197, 147, 0.2); color: var(--success); }
.btn-pay:hover { background: rgba(95, 197, 147, 0.18); border-color: rgba(95, 197, 147, 0.35); }
.btn-summary { background: transparent; border-color: var(--border); color: var(--text-muted); }
.btn-summary:hover { background: var(--bg-hover); color: var(--text-secondary); }

/* Modal backdrop */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1.25rem; z-index: 100; }

/* Modal */
.modal { background: var(--bg-surface); border: 1px solid var(--border-mid); border-radius: 18px; width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(0,0,0,0.5); overflow: hidden; }

.modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.25rem 1rem; border-bottom: 1px solid var(--border); }
.modal-header-info { display: flex; flex-direction: column; gap: 0.2rem; }
.modal-name { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
.modal-sub { font-family: 'Rajdhani', sans-serif; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; color: var(--text-muted); }
.modal-sub.amber { color: var(--accent); }
.modal-close { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 16px; color: var(--text-muted); cursor: pointer; flex-shrink: 0; transition: background 0.15s, color 0.15s; }
.modal-close:hover { background: var(--border); color: var(--text-primary); }

.modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }

.field-label { font-family: 'Rajdhani', sans-serif; font-size: 0.76rem; font-weight: 600; letter-spacing: 0.1em; color: var(--text-muted); margin: 0; }

.select-wrap { position: relative; }
.fi-select { width: 100%; padding: 0.8rem 2.5rem 0.8rem 1rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary); font-size: 0.95rem; cursor: pointer; appearance: none; outline: none; min-height: 50px; }
.fi-select:focus { border-color: var(--border-active); }
.sel-arr { position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }

.qty-control { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.qty-btn { width: 56px; height: 56px; background: var(--bg-elevated); border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer; transition: background 0.12s, color 0.12s; display: flex; align-items: center; justify-content: center; }
.qty-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.qty-val { flex: 1; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 700; color: var(--text-primary); background: var(--bg-base); line-height: 56px; }

.add-subtotal { text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; color: var(--accent); padding: 0.25rem 0; }

.fi-input { padding: 0.8rem 1rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary); font-size: 1rem; outline: none; font-family: 'JetBrains Mono', monospace; transition: border-color 0.15s; }
.fi-input:focus { border-color: var(--border-active); }
.fi-input--lg { width: 100%; font-size: 1.4rem; min-height: 56px; text-align: center; }

.confirm-btn { width: 100%; min-height: 52px; padding: 0.875rem 1rem; margin-top: 0.25rem; background: linear-gradient(135deg, var(--accent) 0%, var(--accent-warm) 100%); border: none; border-radius: 14px; color: #0a0c0f; font-family: 'Rajdhani', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; transition: box-shadow 0.2s, opacity 0.2s; }
.confirm-btn:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(217, 165, 68, 0.35); }
.confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.confirm-btn--pay { background: linear-gradient(135deg, var(--success) 0%, var(--accent-warm) 100%); }
.confirm-btn--pay:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(95, 197, 147, 0.3); }

/* Resumen */
.resumen-empty { text-align: center; color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0; }
.resumen-line { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.65rem 0; border-bottom: 1px solid var(--border); }
.resumen-line:last-of-type { border-bottom: none; }
.resumen-left { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; }
.resumen-drink { font-size: 0.95rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.resumen-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
.resumen-qty { font-family: 'Rajdhani', sans-serif; font-size: 0.8rem; color: var(--text-muted); }
.resumen-price { font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; min-width: 56px; text-align: right; }
.resumen-total { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; margin-top: 0.25rem; border-top: 1px solid var(--border-mid); font-family: 'Rajdhani', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted); }
.resumen-total .mono { font-family: 'JetBrains Mono', monospace; font-size: 1rem; }

.free-badge { display: inline-block; padding: 0.1rem 0.4rem; background: var(--success-bg); border: 1px solid rgba(95, 197, 147, 0.2); border-radius: 999px; font-family: 'Rajdhani', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.07em; color: var(--success); white-space: nowrap; }

/* Modal transition */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal { animation: modal-in 0.22s cubic-bezier(0.34, 1.4, 0.64, 1); }
.modal-leave-active .modal { animation: modal-out 0.18s ease forwards; }
@keyframes modal-in { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes modal-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.96); } }
</style>
