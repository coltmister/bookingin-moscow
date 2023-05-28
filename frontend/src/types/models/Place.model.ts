import { CategoryModel } from './Category.model';
import { CoordinatesModel } from './Coordinates.model';
import { CreatorModel } from './Creator.model';

export interface PlaceBaseModel {
    id?: string;
    address: string;
    brief_description: string;
    coords: CoordinatesModel | null;
    email: string;
    name: string;
    url: string;
    landing: Record<string, string>;
    underground: Underground;
}

export interface Underground {
    id: number;
    line: string;
    name: string;
    value?: number;
    label?: string;
}
export type PlaceCreateForm = Omit<PlaceBaseModel, 'id'>;
export interface PlaceModel extends PlaceBaseModel {
    admin_message: null | string;
    creator: CreatorModel;
    image_url: null | string;
    is_active: boolean;
    is_blocked: boolean;
    is_confirmed: null | boolean;
    is_creator: boolean;
    categories?: CategoryModel[];
    rating?: number;
    feedback_count?: number;
    start_time?: string;
    end_time?: string;
}
