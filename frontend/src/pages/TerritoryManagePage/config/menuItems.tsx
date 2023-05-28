import React from 'react';
import { MdAdminPanelSettings, MdCalendarMonth, MdEditDocument, MdPhoto, TbBrandBooking } from 'react-icons/all';

export const menuItems = [
    {
        key: '#calendar',
        icon: <MdCalendarMonth />,
        label: 'Календарь',
    },
    {
        key: '#settings',
        icon: <MdAdminPanelSettings />,
        label: 'Настройки',
    },
    {
        key: '#booking-settings',
        icon: <TbBrandBooking />,
        label: 'Бронирование',
    },
    {
        key: '#documents',
        icon: <MdEditDocument />,
        label: 'Документы',
    },
    {
        key: '#photos',
        icon: <MdPhoto />,
        label: 'Фотографии',
    },
];
