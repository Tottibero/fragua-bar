import api from './api'
import type { CreatePaymentPayload } from '@/types'

export const paymentsService = {
  create(payload: CreatePaymentPayload): Promise<unknown> {
    return api.post('/payments', payload).then(r => r.data)
  },
}
