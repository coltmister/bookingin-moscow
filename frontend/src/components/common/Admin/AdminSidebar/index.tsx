import { Layout, Menu, MenuProps } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { menuItems } from './menuItems';
import s from './style.module.scss';

const { Sider } = Layout;

export const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hash = location.hash;

    const handleClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
    };
    const defaultSelectedKeys = [hash.length ? hash : '#me'];
    return (
        <Sider className={s.sider} width={250} breakpoint='lg' collapsedWidth='0'>
            <>
                {' '}
                <div className={s.profile}>
                    <p className={s.name}>
                        Управление <br /> Порталом
                    </p>
                </div>
                <Menu
                    theme='dark'
                    mode='inline'
                    defaultSelectedKeys={defaultSelectedKeys}
                    items={menuItems}
                    onSelect={handleClick}
                />
            </>
        </Sider>
    );
};
