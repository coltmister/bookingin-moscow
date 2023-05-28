import { Layout, Menu, MenuProps } from 'antd';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useGetPlaceByIdQuery } from '@/services';
import { useGetTerritoryByIdQuery } from '@/services';
import { Back } from '@/ui';

import { menuItems } from '../../../pages/TerritoryManagePage/config/menuItems';
import s from './style.module.scss';

const { Sider } = Layout;

export const TerritorySidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hash = location.hash;
    const params = useParams();

    const { data: currentPlace, isLoading } = useGetPlaceByIdQuery(params?.id, { skip: !params?.id });
    const { data: currentTerritory, isLoading: isTerritoryLoading } = useGetTerritoryByIdQuery(params?.territoryId, {
        skip: !params?.territoryId,
    });

    const handleClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
    };
    const hasData = !isLoading && !isTerritoryLoading && currentTerritory && currentPlace;
    const defaultSelectedKeys = [hash.length ? hash : '#me'];
    return (
        <Sider width={250} breakpoint='lg' collapsedWidth='0'>
            {hasData && (
                <>
                    <div className={s.profile}>
                        <Back />
                        <p className={s.name}>{currentTerritory.name}</p>
                    </div>
                    <Menu
                        theme='dark'
                        mode='inline'
                        defaultSelectedKeys={defaultSelectedKeys}
                        items={menuItems}
                        onSelect={handleClick}
                    />
                </>
            )}
        </Sider>
    );
};
