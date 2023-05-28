import React from 'react';

import { SiteDocuments } from '../../../components/common/SiteDocuments';
import { SitePhotos } from '../../../components/common/SitePhotos';
import { SiteTerritories } from '../../../components/common/SiteTerritories';
import { SiteTestimonials } from '../../../components/common/SiteTestimomials';

export const pathsComponentMapper = {
    '#territories': <SiteTerritories />,
    '#testimonials': <SiteTestimonials />,
    '#documents': <SiteDocuments />,
    '#photos': <SitePhotos />,
};

export type ProfilePaths = keyof typeof pathsComponentMapper;
