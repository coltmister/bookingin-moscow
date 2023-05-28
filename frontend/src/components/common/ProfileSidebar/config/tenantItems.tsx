import { UserOutlined } from '@ant-design/icons';
import React from 'react';
import { HiOutlineChatBubbleOvalLeft, MdOutlineBookmarkBorder, SlOrganization } from 'react-icons/all';

export const tenantItems = [
    {
        key: '#me',
        icon: <UserOutlined />,
        label: 'Профиль',
    },
    {
        key: '#bookings',
        icon: <MdOutlineBookmarkBorder />,
        label: 'Мои бронирования',
    },
    {
        key: '#testimonials',
        icon: <HiOutlineChatBubbleOvalLeft />,
        label: 'Мои отзывы',
    },
];
