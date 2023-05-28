import { Button, Descriptions, Divider, Empty, message, Modal, Row, Table } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useToggle } from 'usehooks-ts';

import { territoryColumns, userColumns } from '@/constants';
import { useDenyUserBookingMutation, useGetCurrentUserQuery, useGetUserBookingsQuery } from '@/services';

import { useGetTestimonialsQuery } from '../../../services/TestimonialService/Testimonial.service';
import { ConfirmationForm } from '../../common/ConfirmationForm';
import { TestimonialCard } from '../../common/TestimonialCard';

export const Profile = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [confirmModal, toggleConfirmModal] = useToggle();
    const { data } = useGetCurrentUserQuery();
    const { data: testimonial } = useGetTestimonialsQuery({ my: true });
    const { data: bookings } = useGetUserBookingsQuery({ itemsPerPage: 100 });
    const [denyBooking] = useDenyUserBookingMutation();
    const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);
    const [offerUrl, setOfferUrl] = useState<string>('');

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
    const onConfirmClick = useCallback(
        (booking_id: string, offerUrl: string) => {
            setConfirmingBookingId(booking_id);
            setOfferUrl(offerUrl);
            toggleConfirmModal();
        },
        [denyBooking, messageApi]
    );

    const handleOnConfirm = () => {
        messageApi.success('Бронирование подтверждено');
        toggleConfirmModal();
    };
    const handleCancel = () => {
        toggleConfirmModal();
        setConfirmingBookingId('');
        setOfferUrl('');
    };
    const filteredActual = bookings?.payload?.filter((item) => [1, 2, 3].includes(item.status.id));

    const columns = useMemo(() => userColumns(onDenyClick, onConfirmClick), [onDenyClick, onConfirmClick]);
    return (
        <div>
            {data && (
                <>
                    <h2 style={{ marginTop: 16 }}>
                        {data.surname} {data.name} {data.patronymic}
                    </h2>
                    <Descriptions style={{ marginTop: 16 }}>
                        <Descriptions.Item label='Телефон'>{data?.phone}</Descriptions.Item>
                        <Descriptions.Item label={'Email'}>{data?.email}</Descriptions.Item>
                        <Descriptions.Item label={'Дата рождения'}>
                            {data.date_of_birth?.split('-')?.reverse()?.join('.') ?? 'Не указана'}
                        </Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <Row wrap={false} style={{ gap: 8, margin: '16px 0', justifyContent: 'space-between' }}>
                        <h2>Актуальные бронирования</h2>
                        <Button style={{ color: '#E74362' }} type={'link'} href={'/profile#bookings'}>
                            Все бронирования
                        </Button>
                    </Row>
                    {Array.isArray(filteredActual) && <Table dataSource={filteredActual} columns={columns} />}
                    <Divider />
                    <Row wrap={false} style={{ gap: 8, margin: '16px 0', justifyContent: 'space-between' }}>
                        <h2>Последние отзывы</h2>
                        <Button style={{ color: '#E74362' }} type={'link'} href={'/profile#testimonials'}>
                            Все отзывы
                        </Button>
                    </Row>
                    <Row
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 16,
                            width: '100%',
                            justifyContent: !testimonial?.payload?.length ? 'center' : 'space-between',
                        }}
                    >
                        {!!testimonial?.payload?.length &&
                            testimonial.payload
                                .slice(0, 3)
                                .map((item) => <TestimonialCard type={'tenant'} key={item.id} testimonial={item} />)}
                        {!testimonial?.payload?.length && <Empty description={'Вы пока не оставляли отзывов'} />}
                    </Row>
                    <Modal title={'Подписание оферты'} footer={null} open={confirmModal} onCancel={handleCancel}>
                        <ConfirmationForm
                            offerUrl={offerUrl}
                            onSuccess={handleOnConfirm}
                            bookingId={confirmingBookingId}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};
