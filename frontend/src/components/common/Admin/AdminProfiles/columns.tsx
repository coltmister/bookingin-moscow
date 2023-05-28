import { DownOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, MenuProps, Row, Space, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React from 'react';
import { BiCheck, CgClose, GrDocumentVerified } from 'react-icons/all';

import { BookingModel, UserModel } from '@/models';

export const adminProfileColumns: (onClick) => ColumnsType<UserModel> = (onClick) => [
    {
        title: 'Аватар',
        dataIndex: 'avatar_thumbnail_url',
        key: 'avatar_thumbnail_url',
        width: 90,
        render: (url, cell) => (
            <Avatar
                alt={'Фото'}
                src={cell.avatar_thumbnail_url}
                style={{ objectFit: 'cover', borderRadius: '50%', height: 50, width: 50 }}
            />
        ),
    },
    {
        title: 'ФИО',
        dataIndex: 'surname',
        key: 'surname',
        render: (url, cell) => `${cell.surname} ${cell.name} ${cell.patronymic}`,
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Телефон',
        dataIndex: 'phone',
        key: 'phone',
    },
    {
        title: 'Роль',
        dataIndex: ['role', 'name'],
        key: 'role',
    },
    {
        title: 'Верификация',
        dataIndex: 'is_verified',
        key: 'is_verified',
        render: (flag) => (flag ? <BiCheck /> : <CgClose />),
    },
    {
        title: 'Администратор',
        dataIndex: 'is_admin',
        key: 'is_admin',
        render: (flag) => (flag ? <BiCheck /> : <CgClose />),
    },
    {
        title: 'Активен',
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
                            { key: 'verify', label: !cell.is_verified ? 'Верифицировать' : 'Смнять верификацию' },
                            { key: 'promote', label: cell.role.id === 3 ? 'Вернуть роль' : 'Сделать админом' },
                            { key: 'activate', label: cell.is_active ? 'Деактивировать' : 'Активировать' },
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
