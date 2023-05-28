import { Divider, message, Modal, Table } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { territoryColumns } from '@/constants';
import {
    useAcceptUserBookingMutation,
    useDenyUserBookingByLandlordMutation,
    useEndUserBookingByLandlordMutation,
    useGetTerritoryBookingsQuery,
} from '@/services';

import { CabinetCalendar } from '../CabinetCalendar';
import { ConfirmationForm } from '../ConfirmationForm';

export const TerritoryCalendar = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const params = useParams();
    const { data } = useGetTerritoryBookingsQuery(
        { territory_id: params?.territoryId ?? '' },
        { skip: !params?.territoryId }
    );
    const [denyBooking] = useDenyUserBookingByLandlordMutation();
    const [acceptBooking] = useAcceptUserBookingMutation();
    const [finishBooking] = useEndUserBookingByLandlordMutation();

    const onDenyClick = useCallback(
        (booking_id: string) => {
            denyBooking({ booking_id }).then((res) => {
                if ('error' in res) {
                    messageApi.error('Ошибка отклонения бронирования');
                } else {
                    messageApi.success('Бронирование отклонено');
                }
            });
        },
        [denyBooking, messageApi]
    );
    const onApproveClick = useCallback(
        (booking_id: string) => {
            acceptBooking({ booking_id }).then((res) => {
                if ('error' in res) {
                    messageApi.error('Ошибка подтверждения бронирования');
                } else {
                    messageApi.success('Бронирование подтверждено');
                }
            });
        },
        [acceptBooking, messageApi]
    );

    const onFinishClick = useCallback(
        (booking_id: string) => {
            finishBooking({ booking_id }).then((res) => {
                if ('error' in res) {
                    messageApi.error('Ошибка завершения бронирования');
                } else {
                    messageApi.success('Бронирование завершено');
                }
            });
        },
        [acceptBooking, messageApi]
    );

    const filteredActual = data?.payload?.filter((item) => [1, 2, 3].includes(item.status.id));

    const columns = useMemo(
        () => territoryColumns(onDenyClick, onApproveClick, onFinishClick),
        [onApproveClick, onDenyClick, onFinishClick]
    );

    return (
        <div>
            {contextHolder}
            {data && (
                <>
                    {Array.isArray(filteredActual) && !!filteredActual.length && (
                        <div>
                            <h2 style={{ margin: '16px 0' }}>Требуют внимания</h2>
                            <Table dataSource={filteredActual} columns={columns} />
                            <Divider />
                        </div>
                    )}
                    <h2 style={{ margin: '16px 0' }}>Календарь бронирований</h2>
                    <CabinetCalendar />
                </>
            )}
        </div>
    );
};
