import { BookingModel } from '@/models';

import { WorkingHoursItem } from '../TerritoryBookingService/TerritoryBooking.dto';

export type UserBookingResponse = {
    payload: Array<BookingModel>;
    hasNextPage: boolean;
    total_count: number;
    total_pages: number;
};

export type AvailableDates = Record<string, boolean>;

export interface AvailableDatesRequest {
    territory_id: string;
    month: number;
    year: number;
}

export interface AvailableTimeslotsRequest {
    territory_id: string;
    date: string;
}

export type AvailableDatesResponse = AvailableDates;
export type AvailableTimeslotsResponse = Array<WorkingHoursItem>;
