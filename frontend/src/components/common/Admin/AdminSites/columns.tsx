import { DownOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, MenuProps, Row, Space, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React from 'react';
import { BiCheck, CgClose, GrDocumentVerified } from 'react-icons/all';

import { BookingModel, PlaceModel, UserModel } from '@/models';

export const adminSitesColumns: (onClick) => ColumnsType<PlaceModel> = (onClick) => [
    {
        title: 'Фото',
        dataIndex: 'image_url',
        key: 'image_url',
        width: 90,
        render: (url, cell) => (
            <Avatar
                alt={'Фото'}
                src={cell.image_url}
                style={{ objectFit: 'cover', borderRadius: '50%', height: 50, width: 50 }}
            />
        ),
    },
    {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Рейтинг',
        dataIndex: 'rating',
        key: 'rating',
    },
    {
        title: 'Опубликована',
        dataIndex: 'is_confirmed',
        key: 'is_confirmed',
        render: (flag) => (flag ? <BiCheck /> : <CgClose />),
    },
    {
        title: 'Заблокирована',
        dataIndex: 'is_blocked',
        key: 'is_blocked',
        render: (flag) => (flag ? <BiCheck /> : <CgClose />),
    },
    {
        title: 'Активна',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (flag) => (flag ? <BiCheck /> : <CgClose />),
    },
    {
        title: 'Действия',
        dataIndex: 'operation',
        key: 'operation',
        render: (string, cell) => (
            <Space size='middle'>
                <Dropdown
                    menu={{
                        onClick: (e) => onClick(e, cell),
                        items: [
                            { key: 'block', label: !cell.is_blocked ? 'Заблокировать' : 'Разблокировать' },
                            { key: 'confirm', label: cell.is_confirmed ? 'Снять с публикации' : 'Опубликовать' },
                            { key: 'activate', label: cell.is_active ? 'Удалить' : 'Восстановить' },
                        ],
                    }}
                >
                    <a>
                        Меню <DownOutlined />
                    </a>
                </Dropdown>
            </Space>
        ),
    },
];
