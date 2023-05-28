import { Typography } from 'antd';
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { RootLayout } from '@/layouts';

import { TerritorySidebar } from '../../components/common/TerritorySidebar';
import { useGetTerritoryByIdQuery } from '../../services/TerritoryService/Territory.service';
import { pathsComponentMapper, ProfilePaths } from './config/pathsComponentMapper';
import s from './style.module.css';

export const TerritoryManagePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hash = location.hash as ProfilePaths;
    const params = useParams();

    useEffect(() => {
        if (!hash) {
            navigate('#settings');
        }
    }, [hash]);

    const { data, isLoading } = useGetTerritoryByIdQuery(params?.territoryId, { skip: !params?.territoryId });

    return (
        <RootLayout sidebar={<TerritorySidebar />}>
            {data && (
                <section className={s.profile}>
                    <Typography.Title className={s.title}>Управление территорией {data.name}</Typography.Title>
                    {data && !isLoading && pathsComponentMapper[hash]}
                </section>
            )}
        </RootLayout>
    );
};
