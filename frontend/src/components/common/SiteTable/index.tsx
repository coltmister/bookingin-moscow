import { Col, Row } from 'antd';
import React from 'react';

import { PlaceBaseModel } from '@/models';
import { useGetCurrentUserQuery, useGetPlacesQuery } from '@/services';

import { SiteCard } from '../SiteCard';

interface SiteTable {
    onEdit: (editableItem: PlaceBaseModel) => void;
    onDelete: (id: string) => void;
}
export const SiteList = ({ onEdit, onDelete }: SiteTable) => {
    const { data: user } = useGetCurrentUserQuery();
    const { data } = useGetPlacesQuery({ creator: user?.id ?? '' }, { skip: !user?.id });

    return (
        <Row gutter={[16, 16]}>
            {data &&
                data.payload.map((item) => (
                    <Col key={item.id}>
                        <SiteCard site={item} onDelete={onDelete} onEdit={onEdit} />
                    </Col>
                ))}
        </Row>
    );
};
