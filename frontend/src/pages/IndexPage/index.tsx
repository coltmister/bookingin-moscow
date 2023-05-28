import React from 'react';

import { RootLayout } from '@/layouts';
import { ScrollTop } from '@/ui';
import {
    MainPageFeedbacks,
    MainPageHero,
    MainPageHowToBook,
    MainPagePlaces,
    MainPagePopular,
    MainPageSupport,
} from '@/widgets';

export const IndexPage = () => {
    return (
        <RootLayout>
            <MainPageHero />
            <MainPagePlaces />
            <MainPagePopular />
            <MainPageHowToBook />
            <MainPageFeedbacks />
            <MainPageSupport />
            <ScrollTop />
        </RootLayout>
    );
};
