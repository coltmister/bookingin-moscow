import { PlaceModel } from './Place.model';
import { ServiceModel } from './Service.model';
import { TenantModel } from './Tenant.model';
import { TerritoryModel } from './TerritoryModel';

export interface BookingModel {
    id: string;
    status: BookingStatus;
    is_offer_signed: boolean;
    offer_url: string;
    territory: TerritoryModel;
    site: PlaceModel;
    tenant: TenantModel;
    services: Array<BookingService>;
    date: string;
    time_slots: Array<BookingTimeSlot>;
}

export interface BookingStatus {
    id: 1 | 2 | 3 | 4;
    name: BookingStatusName;
}

export enum BookingStatusName {
    'Согласовано',
}

export interface BookingService {
    service: ServiceModel;
    units: null | number | string; //Уточнить
    is_picked: boolean;
}

export interface BookingTimeSlot {
    end: string;
    start: string;
}
