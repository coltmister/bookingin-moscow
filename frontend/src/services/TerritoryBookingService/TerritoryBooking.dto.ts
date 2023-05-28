import { BookingModel } from '@/models';

export type TerritoryBookingResponse = BookingModel;

export interface WeekdayWorkingHours {
    id: number;
    name: string;
}

export interface WorkingHoursItem {
    end: string;
    start: string;
}
export interface TerritoryWorkingHours {
    id: string;
    weekday: WeekdayWorkingHours;
    is_day_off: boolean;
    working_hours: Array<WorkingHoursItem>;
}

export type TerritoryWorkingHoursResponse = Array<TerritoryWorkingHours>;

export interface ManageTerritoryWorkingHoursRequest extends Omit<TerritoryWorkingHours, 'id' | 'weekday'> {
    id?: string;
    weekday: number;
    territory_id: string;
}
