import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { KeykloackForm } from '@/components';
import { KEYCLOACK_API_URL } from '@/constants';
import { STORAGE } from '@/services';

interface AuthContextValue {
    isAuth: boolean;
    isValidated: boolean;
}

export const AuthContext = React.createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const params = new URLSearchParams(window.location.search);

    const [isAuth, setIsAuth] = useState(false);
    const [isValidated, setIsValidated] = useState(true);

    const keycloakCode = params.get('code');
    const isRedirectedFromKeycloak = !!keycloakCode;
    const isLoggedOut =
        params.get('logout') || window.location.hash.includes('logout') || window.location.search.includes('logout');

    useEffect(() => {
        if (isRedirectedFromKeycloak) {
            try {
                fetch(
                    `${KEYCLOACK_API_URL}api/v1/iam/auth/obtain-tokens/?code=${keycloakCode}&redirect_uri=${window.location.origin}/`
                )
                    .then((r) => {
                        return r.json();
                    })
                    .then((data: { access_token: string; refresh_token: string }) => {
                        params.delete('session_state');
                        params.delete('code');
                        const newParams = params.toString();
                        window.location.search = newParams === '?' ? '' : newParams;
                        if (data.access_token) {
                            STORAGE.setToken(data.access_token);
                            localStorage.setItem('refresh_token', data.refresh_token);
                        }
                    });
            } catch (e) {
                setIsValidated(false);
                console.log(e);
            } finally {
                setIsAuth(true);
                setIsValidated(true);
            }
        } else {
            if (isLoggedOut) {
                console.log('here');
                STORAGE.clear();
            }

            try {
                const isAuth = !!STORAGE.getToken();
                setIsAuth(isAuth);
            } catch (_e) {
                setIsAuth(false);
            } finally {
                setIsValidated(true);
            }
        }
    }, [isRedirectedFromKeycloak, keycloakCode]);

    const value = useMemo(
        () => ({
            isAuth,
            isValidated,
        }),
        [isAuth, isValidated]
    );
    return (
        <AuthContext.Provider value={value}>
            {/* TODO: Спрятать это под кат? */}
            <KeykloackForm />
            {children}
        </AuthContext.Provider>
    );
};
