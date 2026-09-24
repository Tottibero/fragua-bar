import { offlineStore } from './offline-store'

export async function readEventCache<T>(key: string) {
  try {
    return (await offlineStore.getCache<T>(key))?.value
  } catch {
    return undefined
  }
}

export function writeEventCache<T>(key: string, value: T) {
  return offlineStore.putCache(key, value).catch(() => undefined)
}
