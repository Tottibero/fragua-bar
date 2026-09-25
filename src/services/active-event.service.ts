import api from './api'
import type {
  Event, BarBootstrapResponse, BarLedgerResponse,
  AttendeesResponse, Attendee, UpdateAttendeePayload,
  EventDrink, UpdateEventDrinkPayload,
  ConsumptionsResponse, Consumption, CreateConsumptionPayload,
} from '@/types'

const B = '/events/active'

export const activeEventService = {
  getActive: (): Promise<Event> =>
    api.get(B).then(r => r.data),

  getBarBootstrap: (): Promise<BarBootstrapResponse> =>
    api.get(`${B}/bar/bootstrap`).then(r => {
      const response = r.data
      return {
        event: { ...response.event, price: String(response.event.price) },
        attendees: response.attendees.map((attendee: Omit<Attendee, 'payment' | 'noShow'> & { entryPaid: boolean }) => ({
          ...attendee,
          noShow: false,
          payment: attendee.entryPaid ? { id: `entry-${attendee.id}`, amount: String(response.event.price) } : null,
        })),
      }
    }),

  getBarDrinks: (): Promise<EventDrink[]> =>
    api.get(`${B}/bar/drinks`).then(r => r.data.drinks.map((drink: { id: string; name: string; price: string; available: boolean }) => ({
      id: drink.id,
      drinkId: drink.id,
      drink: { id: drink.id, name: drink.name },
      price: drink.price,
      available: drink.available,
    }))),

  getBarLedger: (): Promise<BarLedgerResponse> =>
    api.get(`${B}/bar/ledger`).then(r => r.data),

  // Attendees
  getAttendees: (): Promise<AttendeesResponse> =>
    api.get(`${B}/attendees`).then(r => r.data),
  updateAttendee: (aid: string, p: UpdateAttendeePayload): Promise<Attendee> =>
    api.patch(`${B}/attendees/${aid}`, p).then(r => r.data),

  // Event drinks (carta)
  getEventDrinks: (): Promise<EventDrink[]> =>
    api.get(`${B}/drinks`).then(r => r.data),
  updateEventDrink: (edid: string, p: UpdateEventDrinkPayload): Promise<EventDrink> =>
    api.patch(`${B}/drinks/${edid}`, p).then(r => r.data),

  // Consumptions
  getConsumptions: (): Promise<ConsumptionsResponse> =>
    api.get(`${B}/consumptions`).then(r => r.data),
  addConsumption: (p: CreateConsumptionPayload): Promise<Consumption> =>
    api.post(`${B}/consumptions`, p).then(r => r.data),
  deleteConsumption: (cid: string): Promise<void> =>
    api.delete(`${B}/consumptions/${cid}`).then(r => r.data),
}
