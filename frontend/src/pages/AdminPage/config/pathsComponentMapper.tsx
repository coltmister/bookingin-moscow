import React from 'react';

import { AdminCategories } from '../../../components/common/Admin/AdminCategories';
import { AdminProfiles } from '../../../components/common/Admin/AdminProfiles';
import { AdminSites } from '../../../components/common/Admin/AdminSites';

export const pathsComponentMapper: Record<string, JSX.Element> = {
    '#me': <AdminProfiles />,
    '#sites': <AdminSites />,
    '#categories': <AdminCategories />,
};

export type ProfilePaths = keyof typeof pathsComponentMapper;
