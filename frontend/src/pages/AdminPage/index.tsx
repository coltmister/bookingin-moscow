import { Typography } from 'antd';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RootLayout } from '@/layouts';
import { useGetCurrentUserQuery } from '@/services';

import { AdminSidebar } from '../../components/common/Admin/AdminSidebar';
import { pathsComponentMapper, ProfilePaths } from './config/pathsComponentMapper';
import s from './style.module.css';

export const AdminPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hash = location.hash as ProfilePaths;

    useEffect(() => {
        if (!hash) {
            navigate('#me');
        }
    }, [hash]);

    const { data, isLoading } = useGetCurrentUserQuery();

    return (
        <RootLayout sidebar={<AdminSidebar />}>
            <section className={s.profile}>
                <Typography.Title className={s.title}>Управление порталом</Typography.Title>
                {data && !isLoading && pathsComponentMapper[hash]}
            </section>
        </RootLayout>
    );
};
