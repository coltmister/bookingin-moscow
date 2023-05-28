import { Api } from '@/services';

import { ManageTerritoryWorkingHoursRequest, TerritoryWorkingHoursResponse } from './TerritoryBooking.dto';

export const TerritoryBookingService = Api.enhanceEndpoints({
    addTagTypes: ['WORKING_HOURS'],
}).injectEndpoints({
    endpoints: (build) => ({
        getWorkingHours: build.query<TerritoryWorkingHoursResponse, string>({
            query: (id) => {
                return {
                    url: `booking/territory/${id}/working-hours`,
                };
            },
            providesTags: ['WORKING_HOURS'],
        }),
        createWorkingHours: build.mutation<null, ManageTerritoryWorkingHoursRequest>({
            query: (payload) => {
                const { territory_id, ...body } = payload;
                return { url: `/booking/territory/${territory_id}/working-hours`, body, method: 'POST' };
            },
            invalidatesTags: ['WORKING_HOURS'],
        }),
        updateWorkingHours: build.mutation<void, ManageTerritoryWorkingHoursRequest>({
            query: ({ territory_id, id, ...body }) => {
                return {
                    url: `/booking/territory/${territory_id}/working-hours/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['WORKING_HOURS'],
        }),
    }),
});

export const { useGetWorkingHoursQuery, useUpdateWorkingHoursMutation, useCreateWorkingHoursMutation } =
    TerritoryBookingService;
