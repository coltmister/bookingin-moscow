import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './settings';

export const Api = createApi({
    reducerPath: 'api',
    tagTypes: [''],
    baseQuery: baseQueryWithReauth,
    endpoints: (build) => ({}),
});
