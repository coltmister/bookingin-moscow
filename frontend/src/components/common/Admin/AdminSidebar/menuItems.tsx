import React from 'react';
import {
    AiFillFolder,
    MdAdminPanelSettings,
    MdCalendarMonth,
    MdEditDocument,
    MdPerson,
    MdPhoto,
    MdPlace,
    TbBrandBooking,
} from 'react-icons/all';

export const menuItems = [
    {
        key: '#me',
        icon: <MdPerson />,
        label: 'Пользователи',
    },
    {
        key: '#sites',
        icon: <MdPlace />,
        label: 'Площадки',
    },
];
