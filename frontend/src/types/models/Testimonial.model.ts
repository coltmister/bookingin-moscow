export interface TestimonialPlace {
    id: string;
    name: string;
    is_creator: boolean;
    is_confirmed: boolean;
    is_active: boolean;
    is_blocked: boolean;
    image_url: string;
}

export interface TestimonialTenant {
    id: string;
    name: string;
    surname: string;
    patronymic: string;
    rating: null;
    avatar_thumbnail_url: null | string;
    snp: string;
}

export interface Testimonial {
    id: string;
    site: TestimonialPlace;
    tenant: TestimonialTenant;
    landlord_answer: string;
    rating: number;
    text: string;
    created_at: string;
    updated_at: string;
}
