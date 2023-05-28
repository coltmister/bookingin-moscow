import { Calendar, Checkbox, Divider, Input, message, Modal, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { uniqBy } from 'lodash-es';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { useIsLarge } from '@/hooks';
import { TerritoryModel } from '@/models';
import {
    useCreateUserBookingMutation,
    useGetAvailableDatesForTerritoryQuery,
    useGetAvailableTimeSlotsLazyQuery,
    useGetAvailableTimeSlotsQuery,
    useGetTerritoryAdditionalServicesByIdQuery,
    UserBookingService,
} from '@/services';
import { Empty } from '@/ui';
import { disabledPastDates } from '@/utils';

import s from './styles.module.scss';

interface BookingFormProps extends TerritoryModel {
    isOpen?: boolean;
    onModalHandler?: () => void;
}

export const BookingForm = ({ id, name, isOpen, onModalHandler }: BookingFormProps) => {
    const form = useForm();
    const { fields, append } = useFieldArray({ control: form.control, name: 'services' });
    const isLarge = useIsLarge();
    const [api, holder] = message.useMessage();
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month());
    const [createBooking, { isError }] = useCreateUserBookingMutation();
    const { data: additional } = useGetTerritoryAdditionalServicesByIdQuery(id, {
        skip: !isOpen,
    });
    const { data: dates } = useGetAvailableDatesForTerritoryQuery(
        { territory_id: id, month: month + 1, year },
        {
            refetchOnmountOrArgChange: true,
            skip: !isOpen,
        }
    );

    useEffect(() => {
        if (additional && Array.isArray(form.watch(services)) && !form.watch(services).length) {
            form.setValue('services', additional, { shouldValidate: true });
        }
    }, [additional]);

    const date = dayjs(form.watch('date')).format('YYYY-MM-DD');

    const onInvalidDateChosen = async () => {
        await api.open({
            type: 'error',
            content: 'Вы не можете выбрать прошедшую дату',
        });
    };

    const { data: timeslots } = useGetAvailableTimeSlotsQuery(
        { territory_id: id, date },
        {
            refetchOnmountOrArgChange: true,
            skip: !isOpen,
        }
    );

    const onSubmit = form.handleSubmit(async (data) => {
        console.log(data.services);
        const services = data.services
            .filter((item) => item.is_picked)
            .map((item) => ({ id: item.id, is_picked: item.units ? false : true, units: item.units }));
        createBooking({
            territory_id: id,
            date: dayjs(data.date).format('YYYY-MM-DD'),
            cover_letter: '',
            services,
            time_slots: data.time_slots,
        });

        if (!isError) {
            onModalHandler();
            await api.open({
                type: 'success',
                content: 'Площадка успешно забронирована!',
            });
        }

        if (isError) {
            await api.open({
                type: 'error',
                content: 'Произошла ошибка',
            });
        }
    });

    /* Checkbox */

    const [timeSlots, setTimeSlots] = useState([]);
    const handleCheckTimeSlots = (event) => {
        let updatedList = [...timeSlots];
        if (event.target.checked) {
            updatedList = [...timeSlots, event.target.value];
        } else {
            updatedList.splice(timeSlots.indexOf(event.target.value), 1);
        }
        setTimeSlots(updatedList);
    };

    const [services, setServices] = useState([]);

    useEffect(() => {
        form.setValue('time_slots', timeSlots);
    }, [timeSlots]);

    console.log(fields);

    return (
        <Modal
            title='Бронирование'
            open={isOpen}
            onCancel={onModalHandler}
            onOk={onSubmit}
            okButtonProps={{ disabled: !form.watch('time_slots')?.length }}
        >
            <FormProvider {...form}>
                <h3 className={s.title}>{name}</h3>
                <form onSubmit={onSubmit}>
                    <Space direction={isLarge ? 'horizontal' : 'vertical'} align='start' size={[16, 16]}>
                        <Space direction='vertical' align='start' size={[16, 16]}>
                            <Controller
                                name='date'
                                defaultValue={dayjs()}
                                render={({ field }) => (
                                    <Calendar
                                        {...field}
                                        fullscreen={false}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                        onSelect={(date) => {
                                            if (date < dayjs().startOf('day')) {
                                                return onInvalidDateChosen();
                                            }

                                            setYear(dayjs(date).year());
                                            setMonth(dayjs(date).month());
                                        }}
                                        disabledDate={disabledPastDates}
                                    />
                                )}
                            />
                            {fields?.length && <b>Услуги</b>}
                            {fields?.map((service, i) => (
                                <Row wrap={false} key={i} style={{ display: 'flex', gap: 8 }}>
                                    <Controller
                                        control={form.control}
                                        render={({ field }) => (
                                            <Checkbox className={s.additional} {...field}>
                                                <p>{service.name}</p>
                                                <p>{service.description}</p>
                                            </Checkbox>
                                        )}
                                        name={`services.${i}.is_picked`}
                                    />
                                    {form.watch(`services.${i}.is_picked`) &&
                                        form.watch(`services.${i}.type.id`) === 'quantitative' && (
                                            <Controller
                                                control={form.control}
                                                name={`services.${i}.units`}
                                                render={({ field }) => (
                                                    <Input
                                                        type='number'
                                                        {...field}
                                                        max={form.watch(`services.${i}.max_count`)}
                                                        placeholder={`Введите число ${
                                                            form.watch(`services.${i}.max_count`)
                                                                ? `до ${form.watch(`services.${i}.max_count`)}`
                                                                : ''
                                                        } `}
                                                    />
                                                )}
                                            />
                                        )}
                                </Row>
                            ))}
                        </Space>
                        <div>
                            <b>Сеансы</b>
                            <div className={s.timeslots}>
                                {timeslots?.map((slot, id) => (
                                    <Checkbox key={id} value={slot} onChange={handleCheckTimeSlots}>
                                        {slot.start} - {slot.end}
                                    </Checkbox>
                                ))}
                            </div>

                            <div>
                                {!timeslots?.length && (
                                    <Empty description={'Доступных сеансов на этот день нет'} className={s.empty} />
                                )}
                            </div>
                        </div>
                    </Space>
                </form>
                {holder}
            </FormProvider>
        </Modal>
    );
};
