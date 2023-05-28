import React from 'react';
import { MdEditDocument, MdFeedback, MdLocationCity, MdPhoto } from 'react-icons/all';

export const menuItems = [
    {
        key: '#territories',
        icon: <MdLocationCity />,
        label: 'Территории',
    },
    {
        key: '#testimonials',
        icon: <MdFeedback />,
        label: 'Отзывы',
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
