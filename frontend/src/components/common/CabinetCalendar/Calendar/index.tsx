import { Badge, BadgeProps, Calendar, CalendarProps, Row, Tag, Tooltip } from 'antd';
import { Dayjs } from 'dayjs';
import { useParams } from 'react-router-dom';

import { bookingColors, bookingStatus } from '@/constants';
import { BookingModel } from '@/models';
import { useGetTerritoryBookingsQuery } from '@/services';

import { BookingStatus } from '../../BookingStatus';

interface CustomCalendarProps {
    onDateSelect: (item: BookingModel) => void;
}

export const CustomCalendar = ({ onDateSelect }: CustomCalendarProps) => {
    const params = useParams();
    const { data } = useGetTerritoryBookingsQuery(
        { territory_id: params?.territoryId ?? '' },
        { skip: !params?.territoryId }
    );
    const dateCellRender = (value: Dayjs) => {
        const date = value.format('YYYY-MM-DD');
        const listData = data.payload.filter((item) => item.date === date);
        return (
            <ul style={{ margin: 0, padding: 0 }}>
                {listData.map((item) => (
                    <Tooltip title={bookingStatus[item.status.id]} key={item.id}>
                        <Tag
                            title={item.tenant.name + ' ' + item.tenant.surname}
                            color={bookingColors[item.status.id]}
                            style={{ listStyle: 'none' }}
                            key={item.id}
                            onClick={() => onDateSelect(item)}
                        >
                            {item.tenant.name + item.tenant.surname}
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
