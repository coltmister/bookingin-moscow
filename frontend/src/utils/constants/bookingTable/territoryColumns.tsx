import { Button, Row, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React from 'react';
import { BiCheck, CgClose, FaFlagCheckered, GiFinishLine } from 'react-icons/all';

import { BookingModel } from '@/models';

import { BookingStatus } from '../../../components/common/BookingStatus';
import { timeSlotsToString } from '../../lib/timeSlotsToString';
export const territoryColumns: (
    onDeny: (id: string) => void,
    onApprove: (id: string) => void,
    onFinish: (id: string) => void
) => ColumnsType<BookingModel> = (onDeny, onApprove, onFinish) => [
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
        render: (string, cell) => dayjs(string).locale('ru_RU').format('DD MMM'),
    },
    {
        title: 'Время',
        dataIndex: 'time_slots',
        key: 'time_slots',
        render: (string, cell) => (
            <Typography.Text
                // @ts-ignore
                ellipsis={
                    cell.time_slots.length > 1
                        ? {
                              tooltip: timeSlotsToString(cell.time_slots).join('\n'),
                              suffix: <span style={{ opacity: 0.7 }}>&nbsp; +{cell.time_slots.length - 1}</span>,
                          }
                        : false
                }
            >
                {cell.time_slots && cell.time_slots.length && timeSlotsToString(cell.time_slots)[0]}
            </Typography.Text>
        ),
    },
    {
        title: 'Статус',
        dataIndex: 'status',
        align: 'center',
        key: 'status',
        render: (status) => <BookingStatus status={status} type={'dot'} />,
    },
    {
        title: 'Действия',
        dataIndex: 'actions',
        key: 'actions',
        render: (status, cell) => (
            <Row style={{ gap: 8 }}>
                {cell.status.id === 1 && (
                    <Tooltip title={'Подтвердить'}>
                        <Button onClick={() => onApprove(cell.id)} icon={<BiCheck />} size={'small'} />
                    </Tooltip>
                )}
                {cell.status.id === 3 && (
                    <Tooltip title={'Завершить бронирование'}>
                        <Button onClick={() => onFinish(cell.id)} icon={<FaFlagCheckered />} size={'small'} />
                    </Tooltip>
                )}
                <Tooltip title={'Отклонить'}>
                    <Button onClick={() => onDeny(cell.id)} icon={<CgClose />} size={'small'} />
                </Tooltip>
            </Row>
        ),
    },
];
