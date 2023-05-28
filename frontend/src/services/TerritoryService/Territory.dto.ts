import { TerritoryModel } from '@/models';

export interface TerritoryResponse {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    payload: Array<TerritoryModel>;
}
export type TerritoriesResponse = Array<TerritoryModel>;

export interface TerritoryFieldsForm extends Omit<TerritoryModel, 'category'> {
    category: string;
}

export type TerritoryEditRequest = TerritoryFieldsForm;

export interface TerritorySettingsRequest {
    id: string;
    duration: number;
    max_slots: number;
    external_name: string | null;
    calendar_url: null;
    booking_calendar_url: string | null;
}

export interface AdditionalField {
    id: string;
    name: string;
    type: number; // 1 - bool, 2 - select, 3 - number
    choices: null | Array<string>;
}

export interface AdditionalFieldTerritoryValue {
    id: string;
    add_field: AdditionalField;
    value: boolean | string | number;
}

export interface ManageAdditionalField {
    value_id: string;
    territory_id: string;
    add_field: string;
    value: boolean | string | number;
}

export interface DeleteAdditionalField {
    value_id: string;
    territory_id: string;
}

export interface ServiceType {
    id: ServiceFieldType;
    name: string;
}

export enum ServiceFieldType {
    'quantitative',
    'bool',
}

export interface TerritoryAdditionalServices {
    id: string;
    name: string;
    description: string;
    type: ServiceType | null;
    max_count: null | number;
    is_active: boolean;
}

export interface CreateTerritoryAdditionalService extends Omit<TerritoryAdditionalServices, 'type' | 'id'> {
    type: ServiceFieldType;
    territory_id: string;
}

export interface EditTerritoryAdditionalService extends Omit<TerritoryAdditionalServices, 'type' | 'id'> {
    type: ServiceFieldType;
    territory_id: string;
    service_id: string;
}

export interface DeleteTerritoryAdditionalService {
    territory_id: string;
    service_id: string;
}
