export type UserRole = 'superadmin' | 'admin' | 'user'

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface LoginResponse {
  token: string
  user: { id: string; nickname: string; role: UserRole }
}

export type EventStatus = 'proximo' | 'activo' | 'finalizado'

export interface Event {
  id: string
  name: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  status: EventStatus
  price: string
  color: string
  icon: string
  freeConsumption: boolean
  createdAt: string
  recurrentTasksApplied: boolean
}

// ── Active event sub-resources ───────────────────────────────────────────────

export type AttendeeRole = 'socio' | 'usuario'

export interface Attendee {
  id: string
  userId: string
  nickname: string
  role: AttendeeRole
  confirmed: boolean
  freeConsumptionUsed: boolean
  noShow: boolean
  payment: { id: string; amount: string } | null
}

export interface AttendeesResponse {
  attendees: Attendee[]
  price: number
  nonMemberCount: number
  totalRevenue: number
}

export interface UpdateAttendeePayload {
  confirmed?: boolean
}

export interface CatalogDrink {
  id: string
  name: string
}

export interface EventDrink {
  id: string
  drinkId: string
  drink: CatalogDrink
  price: string
  available: boolean
}

export interface UpdateEventDrinkPayload {
  available?: boolean
}

export interface Consumption {
  id: string
  attendeeId: string
  eventDrinkId: string
  quantity: number
  isFree: boolean
  eventDrink: EventDrink
}

export interface ConsumptionsResponse {
  consumptions: Consumption[]
  eventDrinks: EventDrink[]
  payments: { id: string; userId: string; amount: string }[]
}

export interface CreateConsumptionPayload {
  attendeeId: string
  eventDrinkId: string
  quantity: number
  isFree?: boolean
}

export interface CreatePaymentPayload {
  userId: string
  type: 'event' | 'consumption'
  eventId: string
  amount: number
  paidAt: string
}
