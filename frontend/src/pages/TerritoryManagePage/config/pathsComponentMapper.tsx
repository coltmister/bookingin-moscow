import React from 'react';

import { SiteDocuments } from '../../../components/common/SiteDocuments';
import { SitePhotos } from '../../../components/common/SitePhotos';
import { SiteTerritories } from '../../../components/common/SiteTerritories';
import { TerritoryBookingSettings } from '../../../components/common/TerritoryBookingSettings';
import { TerritoryCalendar } from '../../../components/common/TerritoryCalendar';
import { TerritoryDocuments } from '../../../components/common/TerritoryDocuments';
import { TerritoryPhotos } from '../../../components/common/TerritoryPhotos';
import { TerritorySettings } from '../../../components/common/TerritorySettings';

export const pathsComponentMapper = {
    '#settings': <TerritorySettings />,
    '#booking-settings': <TerritoryBookingSettings />,
    '#calendar': <TerritoryCalendar />,
    '#documents': <TerritoryDocuments />,
    '#photos': <TerritoryPhotos />,
};

export type ProfilePaths = keyof typeof pathsComponentMapper;
