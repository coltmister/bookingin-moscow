import { Button, Descriptions, Divider, Empty, Row, Table } from 'antd';
import React from 'react';

import { useGetCurrentUserQuery, useGetUserBookingsQuery } from '@/services';

export const LandlordProfile = () => {
    const { data } = useGetCurrentUserQuery();
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
                </>
            )}
        </div>
    );
};
