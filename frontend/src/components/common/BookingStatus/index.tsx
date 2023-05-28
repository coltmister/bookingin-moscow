import { Badge, Tag, Tooltip } from 'antd';
import React from 'react';

import { bookingColors, bookingShortStatus, bookingStatus } from '@/constants';
import { BookingStatus as BookingStatusType } from '@/models';

import s from './style.module.scss';

export interface BookingStatusProps {
    status: BookingStatusType;
    type: 'dot' | 'tag';
}

export const BookingStatus = ({ status, type }: BookingStatusProps) => {
    if (type === 'tag') {
        return <Tag color={bookingColors[status.id]}>{bookingShortStatus[status.id]}</Tag>;
    }
    return (
        <Tooltip title={bookingStatus[status.id]}>
            <Badge className={s.badge} count={0} color={bookingColors[status.id]} />
        </Tooltip>
    );
};
