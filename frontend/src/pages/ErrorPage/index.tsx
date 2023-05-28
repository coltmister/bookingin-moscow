import { Button } from 'antd';
import React from 'react';

import { ERROR_MESSAGE } from '@/constants';
import { WarningIcon } from '@/icons';

import s from './style.module.css';

export const ErrorPage = () => {
    return (
        <section className={s.error}>
            <div className={s.content}>
                <WarningIcon />
                <h1 className={s.title}>Произошла ошибка</h1>
                <Button type='link' href='/'>
                    {ERROR_MESSAGE.forbidden}
                </Button>
            </div>
        </section>
    );
};
