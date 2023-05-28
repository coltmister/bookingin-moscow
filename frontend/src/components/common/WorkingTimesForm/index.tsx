import { SaveOutlined } from '@ant-design/icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Empty, Input, message, Row, Switch } from 'antd';
import React from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BiPencil, BiReset, BiTrash, MdPlusOne } from 'react-icons/all';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import {
    ManageTerritoryWorkingHoursRequest,
    TerritoryWorkingHours,
} from '../../../services/TerritoryBookingService/TerritoryBooking.dto';
import {
    useCreateWorkingHoursMutation,
    useUpdateWorkingHoursMutation,
} from '../../../services/TerritoryBookingService/TerritoryBooking.service';
import { wokringHoursValidation } from '../../../utils/lib/wokringHoursValidation';

export interface WorkingTimesFormProps {
    defaultItem?: TerritoryWorkingHours;
    activeWeekday: number;
}

const defaultValues = (defaultItem: TerritoryWorkingHours, activeWeekday: number, territoryId: string) => {
    if (defaultItem) {
        return {
            territory_id: territoryId,
            weekday: activeWeekday,
            is_day_off: defaultItem.is_day_off,
            working_hours: defaultItem.working_hours,
            id: defaultItem.id,
        };
    }
    return {
        territory_id: territoryId,
        weekday: activeWeekday,
        is_day_off: false,
        working_hours: [],
    };
};
export const WorkingTimesForm = ({ defaultItem, activeWeekday }: WorkingTimesFormProps) => {
    const [messageApi, contextHolder] = message.useMessage();

    const [isEditing, toggleIsEditing] = useToggle();
    const params = useParams();
    const territoryId = params.territoryId ?? '';
    const form = useForm<ManageTerritoryWorkingHoursRequest>({
        defaultValues: defaultValues(defaultItem, activeWeekday, territoryId),
        resolver: yupResolver(wokringHoursValidation),
    });
    const { control, watch } = form;

    const { fields, append, remove } = useFieldArray({ control, name: 'working_hours' });

    const [createWorkingHours] = useCreateWorkingHoursMutation();
    const [updateWorkingHours] = useUpdateWorkingHoursMutation();

    const onSubmit: SubmitHandler<ManageTerritoryWorkingHoursRequest> = (e) => {
        const action = defaultItem ? updateWorkingHours : createWorkingHours;
        console.log(e);
        if (e.is_day_off) {
            e.working_hours = [];
        }

        action(e).then((res) => {
            if ('data' in res) {
                toggleIsEditing();
                messageApi.success('День обновлен');
            } else {
                messageApi.error('Ошибка при сохранении');
            }
        });
    };

    const handleReset = () => {
        toggleIsEditing();
        form.reset();
    };

    console.log(watch('is_day_off'));

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
            style={{ width: '100%', padding: '0 16px' }}
        >
            {contextHolder}
            <Row style={{ gap: 16, alignItems: 'baseline' }}>
                <h2>Расписание</h2>
                {!isEditing && (
                    <Button type={'text'} icon={<BiPencil />} onClick={toggleIsEditing}>
                        Редактировать
                    </Button>
                )}
                {isEditing && (
                    <Row style={{ gap: 8 }}>
                        <Button type={'text'} htmlType={'submit'} icon={<SaveOutlined />}>
                            Сохранить
                        </Button>
                        <Button type={'text'} htmlType={'submit'} icon={<BiReset />} onClick={handleReset}>
                            Отменить
                        </Button>
                    </Row>
                )}
            </Row>
            <Row wrap={false} style={{ gap: 8 }}>
                <Controller
                    render={({ field }) => <Switch {...field} checked={field.value} disabled={!isEditing} />}
                    name='is_day_off'
                    control={control}
                />
                <p>Выходной</p>
            </Row>
            {watch('is_day_off') ? (
                <Empty description={'На выходные дни расписание не заполянется'} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {fields.length
                        ? fields.map((field, index) => (
                              <Row key={index} style={{ gap: 8, alignItems: 'center' }}>
                                  <Controller
                                      render={({ field }) => <Input style={{ width: 100 }} type={'time'} {...field} />}
                                      name={`working_hours.${index}.start`}
                                      control={control}
                                  />
                                  —
                                  <Controller
                                      render={({ field }) => <Input style={{ width: 100 }} type={'time'} {...field} />}
                                      name={`working_hours.${index}.end`}
                                      control={control}
                                  />
                                  <Button icon={<BiTrash />} type={'text'} onClick={() => remove(index)} />
                              </Row>
                          ))
                        : !isEditing && <Empty description={'Еще нет временных слотов'} />}
                    {isEditing && (
                        <Button
                            style={{ width: 'fit-content' }}
                            icon={<MdPlusOne />}
                            onClick={() => append({ start: '00:00', end: '00:00' })}
                        >
                            Добавить интервал
                        </Button>
                    )}
                </div>
            )}
        </form>
    );
};
