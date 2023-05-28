import { PlaceModel } from './Place.model';

export interface TerritoryModel {
    id: string;
    name: string;
    brief_description: string;
    description: string;
    price: number;
    category: TerritoryModelCategory;
    image_url: string | null;
    site: PlaceModel;
}

export interface TerritoryModelCategory {
    id: string;
    name: string;
}
