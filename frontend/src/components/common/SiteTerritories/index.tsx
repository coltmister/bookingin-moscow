import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Row, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { TerritoryModel } from '@/models';
import { useDeletePlaceMutation, useGetPlaceByIdQuery } from '@/services';

import { TerritoryForm } from '../TerritoryForm';
import { TerritoryList } from '../TerritoryList';
export const SiteTerritories = () => {
    const params = useParams();
    const { data, isLoading } = useGetPlaceByIdQuery(params?.id, { skip: !params?.id });
    const [isOpen, toggle] = useToggle();
    const [editableItem, setEditableItem] = useState<TerritoryModel | null>(null);

    const [deletePlace] = useDeletePlaceMutation();

    const handleOnDelete = (id: string) => {
        return deletePlace(id);
    };

    const handleOnEdit = (editableItem: TerritoryModel) => {
        toggle();
        setEditableItem(editableItem);
    };

    return (
        <div>
            {data && (
                <>
                    <Row wrap={false} style={{ gap: 16, margin: '16px 0', alignItems: 'center' }}>
                        <h2 style={{ margin: 0 }}>Территории «{data.name}»</h2>
                        <Tooltip title='Добавить территорию'>
                            <Button
                                onClick={toggle}
                                size='small'
                                type='primary'
                                shape='circle'
                                icon={<PlusOutlined />}
                            />
                        </Tooltip>
                    </Row>
                    <TerritoryList onEdit={handleOnEdit} onDelete={handleOnDelete} />
                    <Modal footer={false} open={isOpen} onCancel={toggle}>
                        <TerritoryForm defaultItem={editableItem} onClose={toggle} />
                    </Modal>
                </>
            )}
        </div>
    );
};
