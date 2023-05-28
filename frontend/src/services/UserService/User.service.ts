import { Api } from '@/services';

import { UserResponse } from './User.dto';

interface UserParams {
    id: string;
}

export const UserService = Api.enhanceEndpoints({
    addTagTypes: ['USER', 'CURRENT_USER'],
}).injectEndpoints({
    endpoints: (build) => ({
        getUserById: build.query<UserResponse, UserParams>({
            query: ({ id }) => `/users/${id}`,
            providesTags: ['USER'],
        }),
        getCurrentUser: build.query<UserResponse, void>({
            query: () => '/users/me',
            providesTags: ['CURRENT_USER'],
        }),
        uploadUserProfilePhoto: build.mutation<null, { file: FormData }>({
            query: (body) => {
                //Место под обработку FormData если понадобится
                return {
                    url: '/users/avatar',
                    method: 'POST',
                    body: body.file,
                    formData: true,
                };
            },
            invalidatesTags: ['CURRENT_USER'],
        }),
        deleteUserProfilePhoto: build.mutation<null, void>({
            query: () => ({
                url: '/users/avatar',
                method: 'DELETE',
                formData: true,
            }),
            invalidatesTags: ['CURRENT_USER'],
        }),
    }),
});

export const {
    useGetUserByIdQuery,
    useGetCurrentUserQuery,
    useUploadUserProfilePhotoMutation,
    useDeleteUserProfilePhotoMutation,
} = UserService;
