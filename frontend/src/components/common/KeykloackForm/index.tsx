import React from 'react';

import { KEYCLOACK_URL } from '@/constants';

import s from './style.module.css';

export const KeykloackForm = () => {
    return (
        <form id='login' action={`${KEYCLOACK_URL}auth/realms/corp/protocol/openid-connect/auth`} className={s.form} />
    );
};
