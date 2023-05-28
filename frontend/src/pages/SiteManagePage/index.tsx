import { Typography } from 'antd';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RootLayout } from '@/layouts';
import { useGetCurrentUserQuery } from '@/services';

import { SiteSidebar } from '../../components/common/SiteSidebar';
import { pathsComponentMapper, ProfilePaths } from './config/pathsComponentMapper';
import s from './style.module.css';

export const SiteManagePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hash = location.hash as ProfilePaths;

    useEffect(() => {
        if (!hash) {
            navigate('#territories');
        }
    }, [hash]);

    const { data, isLoading } = useGetCurrentUserQuery();

    return (
        <RootLayout sidebar={<SiteSidebar />}>
            <section className={s.profile}>
                <Typography.Title className={s.title}>Управление площадкой</Typography.Title>
                {data && !isLoading && pathsComponentMapper[hash]}
            </section>
        </RootLayout>
    );
};
