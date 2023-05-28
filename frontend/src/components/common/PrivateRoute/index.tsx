import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { STORAGE } from '@/services';

export const PrivateRoute = () => {
    const auth = STORAGE.getToken();

    return auth ? <Outlet /> : <Navigate to='/login' />;
};
