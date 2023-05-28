import { CoordinatesModel, PlaceModel } from '@/models';

export type PlaceResponse = PlaceModel;

export interface PlacesResponse {
    has_next_page: boolean;
    payload: PlaceModel[];
    total_count: number;
    total_pages: number;
}

export interface PlacesFilters {
    territories_category?: string;
    rating__gte?: number;
    rating__lte?: number;
    creator?: string;
    territories__price__gte?: number;
    territories__price__lte?: number;
    sortBy?: keyof PlaceModel;
    sortDesc?: boolean;
    page?: number;
    itemsPerPage?: number;
}

export interface PlaceSuggest {
    address: string;
    coords: CoordinatesModel;
}
export interface PlaceTransformedSuggest {
    value: string;
    label: string;
    coords: CoordinatesModel;
}

export type PlaceSuggestRequest = string;

export type PlaceSuggestResponse = Array<PlaceSuggest>;

export type PlaceSuggestTransformedResponse = Array<PlaceTransformedSuggest>;

export interface PlacePhotosResponse {
    has_next_page: boolean;
    payload: PlacePhotoModel[];
    total_count: number;
    total_pages: number;
}

export interface PlacePhotoModel {
    id: string;
    site: SitePhotoModel;
    file_name: string;
    createdAt: string;
    updatedAt: string;
    url: string;
}

export interface SitePhotoModel {
    id: string;
    name: string;
    address: string;
}
