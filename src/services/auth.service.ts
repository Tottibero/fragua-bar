import api from './api'
import type { LoginCredentials, LoginResponse } from '@/types'

export const authService = {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', credentials).then((r) => r.data)
  },
}
