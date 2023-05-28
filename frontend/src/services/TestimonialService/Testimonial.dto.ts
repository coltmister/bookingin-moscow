import { Testimonial } from '@/models';

export interface TestimonialParamsRequest {
    tenant?: string;
    rating__lte?: number;
    rating__gte?: number;
    site?: string;
    my?: boolean;
}

export interface TestimonialResponse {
    has_next_page: boolean;
    payload: Testimonial[];
    total_count: number;
    total_pages: number;
}

export interface ManageTestimonial {
    id: string;
    text: string;
    rating: string;
}
