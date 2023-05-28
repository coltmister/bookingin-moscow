import { Layout, Menu, MenuProps } from 'antd';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useGetPlaceByIdQuery } from '@/services';

import { menuItems } from '../../../pages/SiteManagePage/config/menuItems';
import s from './style.module.scss';

const { Sider } = Layout;

export const SiteSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hash = location.hash;
    const params = useParams();

    const { data: currentPlace, isLoading } = useGetPlaceByIdQuery(params?.id, { skip: !params?.id });

    const handleClick: MenuProps['onClick'] = (e) => {
        console.log(e);
        navigate(e.key);
    };
    const defaultSelectedKeys = [hash.length ? hash : '#me'];
    return (
        <Sider className={s.sider} width={250} breakpoint='lg' collapsedWidth='0'>
            {!isLoading && currentPlace && (
                <>
                    {' '}
                    <div className={s.profile}>
                        <p className={s.name}>{currentPlace.name}</p>
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
