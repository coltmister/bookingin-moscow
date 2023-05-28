import { STORAGE } from '@/services';

export const useUser = () => {
    const token = STORAGE.getToken();
    const isAuth = !!token;

    return {
        isAuth,
    };
};
