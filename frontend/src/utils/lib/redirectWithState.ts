import { redirect } from 'react-router-dom';

import { router } from '@/pages';

export const redirectWithState = (url: string, data: ResponseInit) => {
    redirect(url, data);
    return router.navigate(url, { state: data });
};
