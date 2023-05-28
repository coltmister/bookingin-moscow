import { Descriptions, Row, Space } from 'antd';
import React from 'react';

import { Avatar, Map } from '@/components';
import {
    useDeleteUserCompanyLogoMutation,
    useGetCompanyByUserIdQuery,
    useGetCurrentUserQuery,
    useUploadUserCompanyLogoMutation,
} from '@/services';

import s from './style.module.scss';

export const UserOrganizations = () => {
    const { data: user } = useGetCurrentUserQuery();
    const { data, isLoading } = useGetCompanyByUserIdQuery({ user_id: user?.id ?? '' }, { skip: !user?.id });

    const [uploadPhoto] = useUploadUserCompanyLogoMutation();
    const [deletePhoto] = useDeleteUserCompanyLogoMutation();

    return (
        <div>
            {data && !isLoading && (
                <>
                    <Space direction='vertical'>
                        <Row style={{ alignItems: 'center', gap: 8, flexWrap: 'nowrap', marginTop: 16 }}>
                            <Avatar
                                url={data.logo_url}
                                className={s.avatar}
                                uploadPhoto={uploadPhoto}
                                deletePhoto={deletePhoto}
                            />
                            <div>
                                <h2 style={{ marginTop: 16 }}>{data.name}</h2>{' '}
                                <Descriptions style={{ marginTop: 16 }}>
                                    {data?.address && (
                                        <Descriptions.Item label='Адрес'>{data?.address}</Descriptions.Item>
                                    )}
                                    {data?.tax_number && (
                                        <Descriptions.Item label={'ИНН'}>{data?.tax_number}</Descriptions.Item>
                                    )}
                                </Descriptions>
                            </div>
                        </Row>
                        <Map
                            className={s.map}
                            places={[{ coords: data.coords, name: data.name }]}
                            center={[+data.coords.longitude, +data.coords.latitude]}
                        />
                    </Space>
                </>
            )}
        </div>
    );
};
