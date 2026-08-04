import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

let _id = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function push(message: string, type: ToastType = 'info') {
    const id = ++_id
    toasts.value.push({ id, type, message })
    setTimeout(() => dismiss(id), 4500)
  }

  function dismiss(id: number) {
    const i = toasts.value.findIndex((t) => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  return {
    toasts,
    success: (msg: string) => push(msg, 'success'),
    error: (msg: string) => push(msg, 'error'),
    info: (msg: string) => push(msg, 'info'),
    dismiss,
  }
})
