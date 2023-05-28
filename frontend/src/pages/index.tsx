import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { PrivateRoute } from '../components/common/PrivateRoute';
import { AdminPage } from './AdminPage';
import { ErrorPage } from './ErrorPage';
import { IndexPage } from './IndexPage';
import { ManagePlacePage } from './ManagePlacePage';
import { PlacePage } from './PlacePage/[id]';
import { PlacesPage } from './PlacesPage';
import { ProfilePage } from './ProfilePage';
import { SiteManagePage } from './SiteManagePage';
import { TerritoryManagePage } from './TerritoryManagePage';

export const router = createBrowserRouter([
    {
        path: '*',
        element: <ErrorPage />,
    },
    {
        path: '/',
        element: <IndexPage />,
    },
    {
        path: '/places',
        element: <PlacesPage />,
    },
    {
        path: '/place/:id',
        element: <PlacePage />,
    },
    {
        path: '/site-manage/:id',
        element: <SiteManagePage />,
    },
    {
        path: '/site-manage/:id/territory/:territoryId',
        element: <TerritoryManagePage />,
    },
    { path: '/admin', element: <AdminPage /> },

    {
        path: '/manage',
        element: <ManagePlacePage />,
    },
    {
        path: 'error',
        element: <ErrorPage />,
    },
    {
        path: '/profile',
        element: <ProfilePage />,
    },
    // {
    //    path: '/profile',
    //  element: <PrivateRoute />,
    // children: [{ path: '/', element: <ProfilePage /> }],
    //},
]);
