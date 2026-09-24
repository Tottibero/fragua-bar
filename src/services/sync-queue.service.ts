import axios from 'axios'
import { shallowRef } from 'vue'
import api from './api'
import { offlineStore, type QueuedMutation } from './offline-store'

export const pendingMutationCount = shallowRef(0)
export const failedMutationCount = shallowRef(0)
export const isSynchronizing = shallowRef(false)
export const isOnline = shallowRef(typeof navigator === 'undefined' ? true : navigator.onLine)

let initialized: Promise<void> | null = null
let retryTimer: ReturnType<typeof setTimeout> | undefined

function operationId() {
  return crypto.randomUUID()
}

async function refreshCounts() {
  const mutations = await offlineStore.getOutbox()
  pendingMutationCount.value = mutations.length
  failedMutationCount.value = mutations.filter(mutation => mutation.lastError).length
  return mutations.sort((a, b) => a.createdAt - b.createdAt)
}

async function initialize() {
  if (!initialized) {
    initialized = refreshCounts().then(() => undefined).catch(() => undefined)
  }
  return initialized
}

function scheduleRetry() {
  if (retryTimer || !isOnline.value) return
  retryTimer = setTimeout(() => {
    retryTimer = undefined
    void flushMutationQueue()
  }, 10_000)
}

export async function enqueueMutation(input: Omit<QueuedMutation, 'id' | 'createdAt'>) {
  await initialize()
  const id = operationId()
  await offlineStore.putMutation({
    ...input,
    id,
    data: { ...input.data, clientOperationId: id },
    createdAt: Date.now(),
  })
  await refreshCounts()
  void flushMutationQueue()
  return id
}

export async function flushMutationQueue() {
  await initialize()
  if (isSynchronizing.value || !isOnline.value) return

  isSynchronizing.value = true
  try {
    const mutations = await refreshCounts()
    for (const mutation of mutations) {
      try {
        await api.request({
          method: mutation.method,
          url: mutation.url,
          data: mutation.data,
          headers: { 'Idempotency-Key': mutation.id },
        })
        await offlineStore.deleteMutation(mutation.id)
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        if (status === 401) {
          await clearOfflineData()
          break
        }
        const isPermanentFailure = status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429
        await offlineStore.putMutation({
          ...mutation,
          lastError: isPermanentFailure ? 'La acción necesita revisión.' : undefined,
        })
        if (!isPermanentFailure) scheduleRetry()
        break
      }
    }
  } finally {
    isSynchronizing.value = false
    await refreshCounts()
  }
}

export function startMutationQueue() {
  void initialize()
  window.addEventListener('online', () => {
    isOnline.value = true
    void flushMutationQueue()
  })
  window.addEventListener('offline', () => { isOnline.value = false })
  window.addEventListener('focus', () => void flushMutationQueue())
  void flushMutationQueue()
}

export async function clearOfflineData() {
  try {
    await Promise.all([offlineStore.clearOutbox(), offlineStore.clearCache()])
  } catch {
    // Storage can be unavailable in private browsing; there is nothing persistent to clear.
  }
  pendingMutationCount.value = 0
  failedMutationCount.value = 0
}
