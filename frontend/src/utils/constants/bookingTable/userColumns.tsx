import { Button, Row, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React from 'react';
import { CgClose, GrDocumentVerified } from 'react-icons/all';

import { BookingModel } from '@/models';

import { BookingStatus } from '../../../components/common/BookingStatus';
import { timeSlotsToString } from '../../lib/timeSlotsToString';
export const userColumns: (
    onDeny: (id: string) => void,
    onSign: (id: string, offer: string) => void
) => ColumnsType<BookingModel> = (onDeny, onSign) => [
    {
        title: '',
        dataIndex: 'Logo',
        key: 'logo',
        width: 90,
        render: (url, cell) => (
            <img
                alt={'Фото'}
                src={cell.territory.image_url ?? cell.site.image_url}
                style={{ objectFit: 'cover', borderRadius: '50%', height: 50, width: 50 }}
            />
        ),
    },
    {
        title: 'Территория',
        dataIndex: ['territory', 'name'],
        key: 'territoryName',
    },
    {
        title: 'Площадка',
        dataIndex: ['site', 'name'],
        key: 'siteName',
        render: (string, cell) => (
            <Button style={{ width: 'fit-content', color: '#E74362' }} href={`/place/${cell.site.id}`} type={'link'}>
                {string}
            </Button>
        ),
    },
    {
        title: 'Дата',
        dataIndex: 'date',
        key: 'date',
        render: (string) => dayjs(string).locale('ru_RU').format('DD MMM'),
    },
    {
        title: 'Время',
        dataIndex: 'time_slots',
        key: 'time_slots',
        render: (string, cell) => {
            return (
                <Tooltip title={timeSlotsToString(cell.time_slots).join('\n')}>
                    <Typography.Text
                        // @ts-ignore
                        ellipsis={
                            cell.time_slots.length > 1
                                ? {
                                      suffix: (
                                          <span style={{ opacity: 0.7 }}>&nbsp; +{cell.time_slots.length - 1}</span>
                                      ),
                                  }
                                : false
                        }
                    >
                        {cell.time_slots && cell.time_slots.length && timeSlotsToString(cell.time_slots)[0]}
                    </Typography.Text>
                </Tooltip>
            );
        },
    },
    {
        title: 'Адрес',
        dataIndex: ['site', 'address'],
        key: 'territoryAddress',
    },
    {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        render: (status) => <BookingStatus status={status} type={'dot'} />,
    },
    {
        title: 'Действия',
        dataIndex: 'actions',
        key: 'actions',
        render: (status, cell) => (
            <Row style={{ gap: 8 }}>
                {cell.status.id === 2 && (
                    <Tooltip title={'Подписать оферту'}>
                        <Button
                            onClick={() => onSign(cell.id, cell.offer_url)}
                            icon={<GrDocumentVerified color={'#E74362'} />}
                            size={'small'}
                        />
                    </Tooltip>
                )}
                <Tooltip title={'Отклонить'}>
                    <Button onClick={() => onDeny(cell.id)} icon={<CgClose />} size={'small'} />
                </Tooltip>
            </Row>
        ),
    },
];
