import { Badge, BadgeProps, Calendar, CalendarProps, Row, Tag, Tooltip } from 'antd';
import { Dayjs } from 'dayjs';
import { useParams } from 'react-router-dom';

import { bookingColors, bookingStatus } from '@/constants';
import { BookingModel } from '@/models';
import { useGetTerritoryBookingsQuery, useGetUserBookingsQuery } from '@/services';

import { BookingStatus } from '../../BookingStatus';

interface CustomCalendarProps {
    onDateSelect: (item: BookingModel) => void;
}

export const CustomCalendar = ({ onDateSelect }: CustomCalendarProps) => {
    const { data } = useGetUserBookingsQuery({ itemsPerPage: 100 });
    const dateCellRender = (value: Dayjs) => {
        const date = value.format('YYYY-MM-DD');
        const listData = data?.payload?.filter((item) => item.date === date) ?? [];
        return (
            <ul style={{ margin: 0, padding: 0 }}>
                {listData.map((item) => (
                    <Tooltip title={bookingStatus[item.status.id]} key={item.id}>
                        <Tag
                            color={bookingColors[item.status.id]}
                            style={{ width: '90%' }}
                            key={item.id}
                            onClick={() => onDateSelect(item)}
                        >
                            {item.territory.name}
                        </Tag>
                    </Tooltip>
                ))}
            </ul>
        );
    };

    const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return info.originNode;
    };

    return <Calendar onPanelChange={console.log} cellRender={cellRender} />;
};
