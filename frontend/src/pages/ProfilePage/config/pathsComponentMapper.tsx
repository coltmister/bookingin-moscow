import React from 'react';

import { LandlordProfile, Profile, UserBookings, UserOrganizations, UserTestimonials } from '@/widgets';

import { UserSites } from '../../../components/widgets/UserSites';

export const pathsComponentMapper: Record<string, JSX.Element> = {
    '#me': <Profile />,
    '#me-landlord': <LandlordProfile />,
    '#bookings': <UserBookings />,
    '#organizations': <UserOrganizations />,
    '#testimonials': <UserTestimonials />,
    '#sites': <UserSites />,
};

export type ProfilePaths = keyof typeof pathsComponentMapper;
