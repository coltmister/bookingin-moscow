import { Api } from '@/services';

import { ManageTestimonial, TestimonialParamsRequest, TestimonialResponse } from './Testimonial.dto';

export const TestimonialService = Api.enhanceEndpoints({
    addTagTypes: ['TESTIMONIALS'],
}).injectEndpoints({
    endpoints: (build) => ({
        getTestimonials: build.query<TestimonialResponse, TestimonialParamsRequest>({
            query: (params) => {
                return {
                    url: `/sites/common/feedbacks`,
                    params,
                };
            },
            providesTags: ['TESTIMONIALS'],
        }),
        createTestimonial: build.mutation<null, ManageTestimonial>({
            query: (payload) => {
                const { id, ...body } = payload;
                return { url: `/sites/sites/${id}/feedbacks`, body, method: 'POST' };
            },
            invalidatesTags: ['TESTIMONIALS'],
        }),
        updateTestimonial: build.mutation<void, ManageTestimonial>({
            query: ({ id, ...body }) => {
                return {
                    url: `/sites/common/feedbacks/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['TESTIMONIALS'],
        }),
        deleteTestimonial: build.mutation<void, string>({
            query: (id) => {
                return {
                    url: `/sites/common/feedbacks/${id}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['TESTIMONIALS'],
        }),
        landlordAnswerTestimonial: build.mutation<null, { id: string; landlord_answer: string }>({
            query: (payload) => {
                const { id, ...body } = payload;
                return { url: `/sites/common/feedbacks/${id}/landlord-answer`, body, method: 'PUT' };
            },
            invalidatesTags: ['TESTIMONIALS'],
        }),
    }),
});

export const {
    useCreateTestimonialMutation,
    useDeleteTestimonialMutation,
    useGetTestimonialsQuery,
    useUpdateTestimonialMutation,
    useLandlordAnswerTestimonialMutation,
} = TestimonialService;
