import { Button, MenuProps } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { KEYCLOACK_URL } from '@/constants';

import s from './styles.module.scss';

export const items = (role: number) => [
    {
        key: 'profile',
        danger: false,
        label: (
            <Link className={s.profile} to={role === 3 ? '/admin' : '/profile'}>
                Профиль
            </Link>
        ),
    },
    {
        key: 'logout',
        danger: true,
        label: (
            <Button
                className={s.exit}
                type='link'
                href={`${KEYCLOACK_URL}auth/realms/corp/protocol/openid-connect/logout?redirect_uri=${window.location.href}?logout=true`}
            >
                Выйти
            </Button>
        ),
    },
];
