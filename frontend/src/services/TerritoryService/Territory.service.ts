import { TerritoryModel } from '@/models';
import { Api } from '@/services';

import { PlacePhotosResponse } from '../PlacesService/Places.dto';
import {
    AdditionalField,
    AdditionalFieldTerritoryValue,
    CreateTerritoryAdditionalService,
    DeleteAdditionalField,
    DeleteTerritoryAdditionalService,
    EditTerritoryAdditionalService,
    ManageAdditionalField,
    TerritoryAdditionalServices,
    TerritoryEditRequest,
    TerritoryResponse,
    TerritorySettingsRequest,
} from './Territory.dto';

export const TerritoryService = Api.enhanceEndpoints({
    addTagTypes: [
        'TERRITORY',
        'TERRITORIES',
        'TERRITORY_PHOTO',
        'TERRITORY_SETTINGS',
        'TERRITORY_ADDITIONAL_FIELDS',
        'TERRITORY_ADDITIONAL_SERVICES',
        'TERRITORY_DOCS',
    ],
}).injectEndpoints({
    endpoints: (build) => ({
        getTerritoriesByCompanyId: build.query<TerritoryResponse, string>({
            query: (companyId) => `/sites/sites/${companyId}/territories`,
            providesTags: ['TERRITORIES'],
        }),
        updateTerritory: build.mutation<null, TerritoryEditRequest>({
            query: (payload) => {
                const { id, ...body } = payload;
                return { url: `/sites/territories/${id}`, body, method: 'PUT' };
            },
            invalidatesTags: ['TERRITORY', 'TERRITORIES'],
        }),
        createTerritory: build.mutation<null, TerritoryEditRequest>({
            query: (payload) => {
                const { id, ...body } = payload;
                return { url: `/sites/sites/${id}/territories`, body, method: 'POST' };
            },
            invalidatesTags: ['TERRITORY', 'TERRITORIES'],
        }),
        uploadTerritoryPhotos: build.mutation<null, { file: FormData; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/territories/${body.id}/photos`,
                    method: 'POST',
                    body: body.file,
                    formData: true,
                };
            },
            invalidatesTags: ['TERRITORY_PHOTO'],
        }),
        getTerritoryPhotos: build.query<PlacePhotosResponse, string>({
            query: (id) => {
                return {
                    url: `/sites/territories/${id}/photos`,
                    method: 'GET',
                };
            },
            providesTags: ['TERRITORY', 'TERRITORY_PHOTO'],
        }),
        deleteTerritoryPhotos: build.mutation<null, { photoId: string; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/sites/${body.id}/photos/${body.photoId}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['TERRITORY', 'TERRITORY_PHOTO'],
        }),
        getTerritoryById: build.query<TerritoryModel, string>({
            query: (id) => {
                return {
                    url: `/sites/territories/${id}`,
                    method: 'GET',
                };
            },
            providesTags: ['TERRITORY'],
        }),
        getTerritorySettingsById: build.query<TerritorySettingsRequest, string>({
            query: (id) => {
                return {
                    url: `/sites/territories/${id}/settings`,
                    method: 'GET',
                };
            },
            providesTags: ['TERRITORY_SETTINGS'],
        }),
        updateTerritorySettingsById: build.mutation<null, TerritorySettingsRequest>({
            query: ({ id, ...body }) => {
                return {
                    url: `/sites/territories/${id}/settings`,
                    body,
                    method: 'PUT',
                };
            },
            invalidatesTags: ['TERRITORY_SETTINGS'],
        }),
        getAdditionalFields: build.query<Array<AdditionalField>, string>({
            query: (id) => {
                return {
                    url: `/sites/categories/${id}/additional-fields`,
                    method: 'GET',
                };
            },
        }),
        getTerritoryAdditionalFieldsById: build.query<Array<AdditionalFieldTerritoryValue>, string>({
            query: (id) => {
                return {
                    url: `/sites/territories/${id}/additional-fields-values`,
                    method: 'GET',
                };
            },
            providesTags: ['TERRITORY_ADDITIONAL_FIELDS'],
        }),
        createTerritoryAdditionalFields: build.mutation<null, ManageAdditionalField>({
            query: ({ territory_id, ...body }) => {
                return {
                    url: `/sites/territories/${territory_id}/additional-fields-values`,
                    method: 'POST',
                    body,
                };
            },
            invalidatesTags: ['TERRITORY_ADDITIONAL_FIELDS'],
        }),
        editTerritoryAdditionalFields: build.mutation<null, ManageAdditionalField>({
            query: ({ territory_id, value_id, ...body }) => {
                return {
                    url: `/sites/territories/${territory_id}/additional-fields-values/${value_id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['TERRITORY_ADDITIONAL_FIELDS'],
        }),
        deleteTerritoryAdditionalFields: build.mutation<null, DeleteAdditionalField>({
            query: ({ territory_id, value_id }) => {
                return {
                    url: `/sites/territories/${territory_id}/additional-fields-values/${value_id}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['TERRITORY_ADDITIONAL_FIELDS'],
        }),
        getTerritoryAdditionalServicesById: build.query<Array<TerritoryAdditionalServices>, string>({
            query: (id) => {
                return {
                    url: `/sites/territories/${id}/additional-services`,
                    method: 'GET',
                };
            },
            providesTags: ['TERRITORY_ADDITIONAL_SERVICES'],
        }),
        createTerritoryAdditionalServices: build.mutation<null, CreateTerritoryAdditionalService>({
            query: ({ territory_id, ...body }) => {
                return {
                    url: `/sites/territories/${territory_id}/additional-services`,
                    method: 'POST',
                    body,
                };
            },
            invalidatesTags: ['TERRITORY_ADDITIONAL_SERVICES'],
        }),
        editTerritoryAdditionalServices: build.mutation<null, EditTerritoryAdditionalService>({
            query: ({ territory_id, service_id, ...body }) => {
                return {
                    url: `/sites/territories/${territory_id}/additional-services/${service_id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['TERRITORY_ADDITIONAL_SERVICES'],
        }),
        deleteTerritoryAdditionalServices: build.mutation<null, DeleteTerritoryAdditionalService>({
            query: ({ territory_id, service_id }) => {
                return {
                    url: `/sites/territories/${territory_id}/additional-services/${service_id}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['TERRITORY_ADDITIONAL_SERVICES'],
        }),
        uploadTerritoryDocs: build.mutation<null, { file: FormData; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/territories/${body.id}/files`,
                    method: 'POST',
                    body: body.file,
                    formData: true,
                };
            },
            invalidatesTags: ['TERRITORY_DOCS'],
        }),
        getTerritoryDocs: build.query<PlacePhotosResponse, string>({
            query: (id) => {
                return {
                    url: `/sites/territories/${id}/files`,
                    method: 'GET',
                };
            },
            providesTags: ['TERRITORY_DOCS'],
        }),
        deleteTerritoryDocs: build.mutation<null, { photoId: string; id: string }>({
            query: (body) => {
                return {
                    url: `/sites/territories/${body.id}/files/${body.photoId}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['TERRITORY_DOCS'],
        }),
    }),
});

export const {
    useGetTerritoriesByCompanyIdQuery,
    useUpdateTerritoryMutation,
    useCreateTerritoryMutation,
    useDeleteTerritoryPhotosMutation,
    useGetTerritoryByIdQuery,
    useGetTerritorySettingsByIdQuery,
    useUpdateTerritorySettingsByIdMutation,
    useGetTerritoryAdditionalFieldsByIdQuery,
    useGetAdditionalFieldsQuery,
    useCreateTerritoryAdditionalFieldsMutation,
    useEditTerritoryAdditionalFieldsMutation,
    useDeleteTerritoryAdditionalFieldsMutation,
    useGetTerritoryAdditionalServicesByIdQuery,
    useCreateTerritoryAdditionalServicesMutation,
    useDeleteTerritoryAdditionalServicesMutation,
    useEditTerritoryAdditionalServicesMutation,
    useGetTerritoryPhotosQuery,
    useUploadTerritoryPhotosMutation,
    useGetTerritoryDocsQuery,
    useUploadTerritoryDocsMutation,
    useDeleteTerritoryDocsMutation,
} = TerritoryService;
