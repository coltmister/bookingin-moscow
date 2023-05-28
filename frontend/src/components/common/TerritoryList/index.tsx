import { Col, Empty, Row } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import { TerritoryModel } from '@/models';

import { useGetTerritoriesByCompanyIdQuery } from '../../../services/TerritoryService/Territory.service';
import { SiteCard } from '../SiteCard';
import { TerritoryCard } from '../TerritoryCard';

interface TerritoryListProps {
    onEdit: (editableItem: TerritoryModel) => void;
    onDelete: (id: string) => void;
}
export const TerritoryList = ({ onEdit, onDelete }: TerritoryListProps) => {
    const params = useParams();
    const { data } = useGetTerritoriesByCompanyIdQuery(params?.id ?? '', { skip: !params?.id });

    return (
        <>
            {data && (
                <Row gutter={[16, 16]}>
                    {data &&
                        data.payload.map((item) => (
                            <Col key={item.id}>
                                <TerritoryCard territory={item} onDelete={onDelete} onEdit={onEdit} />
                            </Col>
                        ))}
                </Row>
            )}
            {data && !data?.payload.length && (
                <Empty style={{ marginTop: 26 }} description={'Здесь пока что нет территорий'} />
            )}
        </>
    );
};
