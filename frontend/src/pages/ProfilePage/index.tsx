import { Typography } from 'antd';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ProfileSidebar } from '@/components';
import { RootLayout } from '@/layouts';
import { useGetCurrentUserQuery } from '@/services';

import { pathsComponentMapper, ProfilePaths } from './config/pathsComponentMapper';
import s from './style.module.css';

export const ProfilePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hash = location.hash as ProfilePaths;
    const { data, isLoading } = useGetCurrentUserQuery();

    useEffect(() => {
        if (!hash) {
            navigate(data?.role?.id === 2 ? '#me-landlord' : '#me');
        }
    }, [hash, data?.role?.id]);

    return (
        <RootLayout sidebar={<ProfileSidebar />}>
            <section className={s.profile}>
                <Typography.Title className={s.title}>Личный кабинет пользователя</Typography.Title>
                {data && !isLoading && pathsComponentMapper[hash]}
            </section>
        </RootLayout>
    );
};
