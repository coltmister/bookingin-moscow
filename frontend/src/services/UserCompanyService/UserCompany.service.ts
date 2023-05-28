import { Api } from '@/services';

import { UserCompanyResponse } from './UserCompany.dto';

interface UserParams {
    user_id: string;
}

export const UserCompanyService = Api.enhanceEndpoints({
    addTagTypes: ['COMPANY'],
}).injectEndpoints({
    endpoints: (build) => ({
        getCompanyByUserId: build.query<UserCompanyResponse, UserParams>({
            query: ({ user_id }) => `/users/${user_id}/company`,
            providesTags: ['COMPANY'],
        }),
        updateUserCompany: build.mutation<null, UserCompanyResponse & UserParams>({
            query: (payload) => {
                const { user_id, ...body } = payload;
                return { url: `/users/${user_id}/company`, body, method: 'PUT' };
            },
            invalidatesTags: ['COMPANY'],
        }),
        uploadUserCompanyLogo: build.mutation<null, { file: FormData }>({
            query: ({ file }) => {
                //Место под обработку FormData если понадобится
                return {
                    url: '/users/company/avatar',
                    method: 'POST',
                    body: file,
                    formData: true,
                };
            },
            invalidatesTags: ['COMPANY'],
        }),
        deleteUserCompanyLogo: build.mutation<null, void>({
            query: () => ({
                url: '/users/company/avatar',
                method: 'DELETE',
            }),
            invalidatesTags: ['COMPANY'],
        }),
    }),
});

export const {
    useGetCompanyByUserIdQuery,
    useUpdateUserCompanyMutation,
    useDeleteUserCompanyLogoMutation,
    useUploadUserCompanyLogoMutation,
} = UserCompanyService;
