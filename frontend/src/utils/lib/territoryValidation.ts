import { url } from 'inspector';
import { boolean, number, object, string } from 'yup';

export const territoryValidation = object({
    name: string().trim().required(),
    brief_description: string().trim().required(),
    description: string().trim().required(),
    price: number().required(),
    category: string().required(),
});

export const territorySettingsValidation = object({
    duration: number().required(),
    max_slots: number().required(),
    external_name: string().trim().nullable(),
    calendar_url: string().url().nullable(),
});

export const territoryAdditionalFieldValidation = object({
    value_id: string(),
    territory_id: string().required(),
    add_field: string().required(),
    value: string().required(),
});

export const territoryAdditionalServiceValidation = object({
    service_id: string(),
    territory_id: string().required(),
    name: string().required(),
    description: string(),
    type: string(),
    max_count: number().nullable(),
    is_active: boolean(),
});
