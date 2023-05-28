import { Api } from '@/services';

import { UserResponse } from '../UserService/User.dto';

interface UserParams {
    user_id: string;
}

export const AdminService = Api.enhanceEndpoints({
    addTagTypes: ['USERS', 'PLACES'],
}).injectEndpoints({
    endpoints: (build) => ({
        getAllUsers: build.query<{ payload: Array<UserResponse> }, { itemsPerPage: 1000 }>({
            query: (params) => ({
                url: `/users`,
                params,
            }),
            providesTags: ['USERS'],
        }),
        updateUserRole: build.mutation<null, UserParams>({
            query: (payload) => {
                const { user_id } = payload;
                return { url: `/users/${user_id}/promote`, method: 'POST' };
            },
            invalidatesTags: ['USERS'],
        }),
        verifyUser: build.mutation<null, UserParams>({
            query: (payload) => {
                const { user_id } = payload;
                return { url: `/users/${user_id}/verify`, method: 'POST' };
            },
            invalidatesTags: ['USERS'],
        }),
        activateUser: build.mutation<null, UserParams>({
            query: (payload) => {
                const { user_id } = payload;
                return { url: `/users/${user_id}/activity-status`, method: 'POST' };
            },
            invalidatesTags: ['USERS'],
        }),
        blockPlace: build.mutation<null, { place_id: string }>({
            query: (payload) => {
                const { place_id } = payload;
                return { url: `/sites/sites/${place_id}/block`, method: 'POST' };
            },
            invalidatesTags: ['PLACES'],
        }),
        activatePlace: build.mutation<null, { place_id: string }>({
            query: (payload) => {
                const { place_id } = payload;
                return { url: `/sites/sites/${place_id}/active`, method: 'POST' };
            },
            invalidatesTags: ['PLACES'],
        }),
        confirmPlace: build.mutation<null, { place_id: string }>({
            query: (payload) => {
                const { place_id } = payload;
                return { url: `/sites/sites/${place_id}/confirm`, method: 'POST' };
            },
            invalidatesTags: ['PLACES'],
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useActivateUserMutation,
    useUpdateUserRoleMutation,
    useVerifyUserMutation,
    useActivatePlaceMutation,
    useBlockPlaceMutation,
    useConfirmPlaceMutation,
} = AdminService;
