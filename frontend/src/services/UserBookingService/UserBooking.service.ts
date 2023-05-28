import { BookingModel, BookingService } from '@/models';
import { Api } from '@/services';
import { FilterSearchParams } from '@/utility-types';

import {
    AvailableDatesRequest,
    AvailableDatesResponse,
    AvailableTimeslotsRequest,
    AvailableTimeslotsResponse,
    UserBookingResponse,
} from './UserBooking.dto';

export interface UserParams {
    user_id: string;
}

export interface CreateUserBookingResponse {
    id: string;
}

export interface ServiceBookingRequest extends Pick<BookingService, 'units' | 'is_picked'> {
    id: string;
}

export interface CreateUserBookingRequest extends Pick<BookingModel, 'date' | 'time_slots'> {
    territory_id: string;
    services: Array<ServiceBookingRequest>;
}

export const UserBookingService = Api.enhanceEndpoints({
    addTagTypes: ['USER_BOOKING'],
}).injectEndpoints({
    endpoints: (build) => ({
        getUserBookings: build.query<UserBookingResponse, FilterSearchParams<BookingModel>>({
            query: (params) => {
                return {
                    url: `/booking/my-booking`,
                    params,
                };
            },
            providesTags: ['USER_BOOKING'],
        }),
        getAvailableDatesForTerritory: build.query<AvailableDatesResponse, AvailableDatesRequest>({
            query: ({ territory_id, ...params }) => {
                return {
                    url: `/booking/territory/${territory_id}/available-dates`,
                    params,
                };
            },
        }),
        getTerritoryBookings: build.query<UserBookingResponse, { territory_id: string }>({
            query: ({ territory_id, ...params }) => ({
                url: `/booking/territory/${territory_id}/booking`,
                params,
            }),
            providesTags: ['USER_BOOKING'],
        }),
        getAvailableTimeSlots: build.query<AvailableTimeslotsResponse, AvailableTimeslotsRequest>({
            query: ({ territory_id, date }) => ({
                url: `/booking/territory/${territory_id}/available-time-slots`,
                params: { date },
            }),
        }),
        initCallingForSigning: build.mutation<void, { booking_id: string }>({
            query: ({ booking_id }) => {
                return {
                    url: `/booking/${booking_id}/init-sign-offer?type=2`,
                    method: 'GET',
                };
            },
        }),
        initEmailForSigning: build.mutation<void, { booking_id: string }>({
            query: ({ booking_id }) => {
                return {
                    url: `/booking/${booking_id}/init-sign-offer?type=1`,
                    method: 'GET',
                };
            },
        }),
        confirmBookingWithCode: build.mutation<null, { confirmation_id: string; code: string }>({
            query: (payload) => {
                const { confirmation_id, ...body } = payload;
                return { url: `/booking/confirmation/${confirmation_id}`, body, method: 'POST' };
            },
            invalidatesTags: ['USER_BOOKING'],
        }),
        createUserBooking: build.mutation<CreateUserBookingResponse, CreateUserBookingRequest>({
            query: (payload) => {
                const { territory_id, ...body } = payload;
                return { url: `/booking/territory/${territory_id}/booking`, body, method: 'POST' };
            },
            invalidatesTags: ['USER_BOOKING'],
        }),
        acceptUserBooking: build.mutation<void, { booking_id: string }>({
            query: ({ booking_id }) => {
                return {
                    url: `/booking/${booking_id}/status`,
                    method: 'PUT',
                    body: { status: 2 },
                };
            },
            invalidatesTags: ['USER_BOOKING'],
        }),
        denyUserBooking: build.mutation<void, { booking_id: string }>({
            query: ({ booking_id }) => ({
                url: `/booking/${booking_id}/status`,
                method: 'PUT',
                body: { status: 5 },
            }),
            invalidatesTags: ['USER_BOOKING'],
        }),
        denyUserBookingByLandlord: build.mutation<void, { booking_id: string }>({
            query: ({ booking_id }) => ({
                url: `/booking/${booking_id}/status`,
                method: 'PUT',
                body: { status: 4 },
            }),
            invalidatesTags: ['USER_BOOKING'],
        }),
        endUserBookingByLandlord: build.mutation<void, { booking_id: string }>({
            query: ({ booking_id }) => ({
                url: `/booking/${booking_id}/status`,
                method: 'PUT',
                body: { status: 6 },
            }),
            invalidatesTags: ['USER_BOOKING'],
        }),
    }),
});

export const {
    useGetUserBookingsQuery,
    useCreateUserBookingMutation,
    useAcceptUserBookingMutation,
    useDenyUserBookingMutation,
    useConfirmBookingWithCodeMutation,
    useDenyUserBookingByLandlordMutation,
    useEndUserBookingByLandlordMutation,
    useGetAvailableDatesForTerritoryQuery,
    useGetTerritoryBookingsQuery,
    useInitCallingForSigningMutation,
    useInitEmailForSigningMutation,
    useGetAvailableTimeSlotsQuery,
    useGetAvailableTimeSlotsLazyQuery,
} = UserBookingService;
