import { UserOutlined } from '@ant-design/icons';
import React from 'react';
import { MdOutlineFactory, TbLocation } from 'react-icons/all';

export const landlordItems = [
    {
        key: '#me-landlord',
        icon: <UserOutlined />,
        label: 'Профиль',
    },

    {
        key: '#organizations',
        icon: <MdOutlineFactory />,
        label: 'Настройки компании',
    },
    {
        key: '#sites',
        icon: <TbLocation />,
        label: 'Мои площадки',
    },
];
