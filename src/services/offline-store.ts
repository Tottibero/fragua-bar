const DATABASE_NAME = 'fragua-bar-offline'
const DATABASE_VERSION = 1
const OUTBOX_STORE = 'outbox'
const CACHE_STORE = 'cache'

export interface QueuedMutation {
  id: string
  method: 'post' | 'patch'
  url: string
  data: Record<string, unknown>
  createdAt: number
  lastError?: string
}

interface CacheEntry<T> {
  key: string
  value: T
  updatedAt: number
}

let databasePromise: Promise<IDBDatabase> | null = null

function database() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(OUTBOX_STORE)) db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' })
        if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE, { keyPath: 'key' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return databasePromise
}

async function run<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await database()
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(storeName, mode).objectStore(storeName))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const offlineStore = {
  getOutbox: () => run<QueuedMutation[]>(OUTBOX_STORE, 'readonly', store => store.getAll()),
  putMutation: (mutation: QueuedMutation) => run<IDBValidKey>(OUTBOX_STORE, 'readwrite', store => store.put(mutation)),
  deleteMutation: (id: string) => run<undefined>(OUTBOX_STORE, 'readwrite', store => store.delete(id)),
  clearOutbox: () => run<undefined>(OUTBOX_STORE, 'readwrite', store => store.clear()),
  getCache: <T>(key: string) => run<CacheEntry<T> | undefined>(CACHE_STORE, 'readonly', store => store.get(key)),
  putCache: <T>(key: string, value: T) => run<IDBValidKey>(CACHE_STORE, 'readwrite', store => store.put({ key, value, updatedAt: Date.now() })),
  clearCache: () => run<undefined>(CACHE_STORE, 'readwrite', store => store.clear()),
}
