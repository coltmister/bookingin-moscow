import { CategoryModel, PlaceBaseModel } from '@/models';
import { Api } from '@/services';

import {
    PlacePhotosResponse,
    PlaceResponse,
    PlacesFilters,
    PlacesResponse,
    PlaceSuggestRequest,
    PlaceSuggestResponse,
    PlaceSuggestTransformedResponse,
} from './Places.dto';

export const PlacesService = Api.enhanceEndpoints({
    addTagTypes: ['PLACES', 'PLACE', 'PHOTO_PLACE', 'DOCS_PLACE'],
}).injectEndpoints({
    endpoints: (build) => ({
        getPlaces: build.query<PlacesResponse, PlacesFilters>({
            query: (params = {}) => ({
                url: '/sites/sites',
                params: params,
            }),
            providesTags: ['PLACES'],
        }),
        getPlacesRecommendedByAi: build.query<PlacesResponse, PlacesFilters>({
            query: (params = {}) => ({
                url: '/sites/sites/recommend',
                params: params,
            }),
            providesTags: ['PLACES'],
        }),
        getPlaceById: build.query<PlaceResponse, string>({
            query: (id) => ({
                url: `/sites/sites/${id}`,
            }),
            providesTags: ['PLACE'],
        }),
        createPlace: build.mutation<{ id: string }, PlaceBaseModel>({
            query: (body) => ({
                url: `/sites/sites`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PLACES'],
        }),
        updatePlace: build.mutation<{ id: string }, PlaceBaseModel>({
            query: (body) => ({
                url: `/sites/sites/${body.id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['PLACES'],
        }),
        deletePlace: build.mutation<void, string>({
            query: (id) => ({
                url: `/sites/sites/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PLACES'],
        }),
        toggleActivatePlace: build.mutation<void, string>({
            query: (string) => ({
                method: 'POST',
                url: `/sites/sites/${string}/active`,
            }),
            invalidatesTags: ['PLACES'],
        }),
        changeSubdomain: build.mutation<void, { id: string; subdomain: string }>({
            query: (payload) => {
                const { id, ...body } = payload;
                return { url: `/sites/sites/${id}/subdomain`, body, method: 'PUT' };
            },
            invalidatesTags: ['PLACES'],
        }),
        getAddressSuggests: build.query<PlaceSuggestTransformedResponse, PlaceSuggestRequest>({
            query: (address) => ({
                url: '/sites/common/suggest',
                params: { address },
            }),
            transformResponse: (response: PlaceSuggestResponse) =>
                response?.map((item) => ({ label: item.address, value: item.address, coords: item.coords })),
        }),
        uploadPlacePhotos: build.mutation<null, { file: FormData; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/sites/${body.id}/photos`,
                    method: 'POST',
                    body: body.file,
                    formData: true,
                };
            },
            invalidatesTags: ['PHOTO_PLACE'],
        }),
        getPlacePhotos: build.query<PlacePhotosResponse, string>({
            query: (id) => {
                return {
                    url: `/sites/sites/${id}/photos`,
                    method: 'GET',
                };
            },
            providesTags: ['PLACE', 'PHOTO_PLACE'],
        }),
        getPlaceCategories: build.query<Array<CategoryModel>, void>({
            query: () => {
                return {
                    url: `/sites/categories`,
                    method: 'GET',
                };
            },
            providesTags: ['PLACE', 'PHOTO_PLACE'],
        }),
        deletePlacePhotos: build.mutation<null, { photoId: string; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/sites/${body.id}/photos/${body.photoId}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['PLACE', 'PHOTO_PLACE'],
        }),
        uploadPlaceDocs: build.mutation<null, { file: FormData; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/sites/${body.id}/files`,
                    method: 'POST',
                    body: body.file,
                    formData: true,
                };
            },
            invalidatesTags: ['DOCS_PLACE'],
        }),
        getPlaceDocs: build.query<PlacePhotosResponse, string>({
            query: (id) => {
                return {
                    url: `/sites/sites/${id}/files`,
                    method: 'GET',
                };
            },
            providesTags: ['PLACE', 'DOCS_PLACE'],
        }),
        deletePlaceDocs: build.mutation<null, { photoId: string; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/sites/${body.id}/files/${body.photoId}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['PLACE', 'DOCS_PLACE'],
        }),
    }),
});

export const {
    useGetPlacesQuery,
    useGetPlaceByIdQuery,
    useCreatePlaceMutation,
    useUpdatePlaceMutation,
    useDeletePlaceMutation,
    useGetAddressSuggestsQuery,
    useToggleActivatePlaceMutation,
    useChangeSubdomainMutation,
    useUploadPlacePhotosMutation,
    useGetPlacePhotosQuery,
    useDeletePlacePhotosMutation,
    useUploadPlaceDocsMutation,
    useGetPlaceDocsQuery,
    useDeletePlaceDocsMutation,
    useGetPlaceCategoriesQuery,
    useGetPlacesRecommendedByAiQuery,
} = PlacesService;
