import api from './api'
import type {
  Event,
  AttendeesResponse, Attendee, UpdateAttendeePayload,
  EventDrink, UpdateEventDrinkPayload,
  ConsumptionsResponse, Consumption, CreateConsumptionPayload,
} from '@/types'

const B = '/events/active'

export const activeEventService = {
  getActive: (): Promise<Event> =>
    api.get(B).then(r => r.data),

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
}
