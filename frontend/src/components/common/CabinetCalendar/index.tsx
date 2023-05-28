import { Modal } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { BookingModel } from '@/models';
import { useGetTerritoryBookingsQuery } from '@/services';

import { CustomCalendar } from './Calendar';
import { CalendarModal } from './CalendarModal';
import s from './style.module.scss';

export const CabinetCalendar = () => {
    const [isModalOpen, toggleModal] = useToggle();
    const [bookingItem, setBookingItem] = useState<BookingModel | null>(null);

    const onDateSelect = (item: BookingModel) => {
        toggleModal();
        setBookingItem(item);
    };

    return (
        <div className={s.calendar}>
            <CustomCalendar onDateSelect={onDateSelect} />
            <Modal open={isModalOpen} title={'Информация о бронировании'} onCancel={toggleModal} footer={null}>
                <CalendarModal bookingItem={bookingItem} />
            </Modal>
        </div>
    );
};
