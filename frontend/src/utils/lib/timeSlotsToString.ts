import { WorkingHoursItem } from '../../services/TerritoryBookingService/TerritoryBooking.dto';export const timeSlotsToString = (timeSlots: Array<WorkingHoursItem>) =>    timeSlots.map((slot) => `${slot.start} - ${slot.end}`);