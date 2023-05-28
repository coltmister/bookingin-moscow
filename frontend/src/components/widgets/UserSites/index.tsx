import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Row, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useToggle } from 'usehooks-ts';

import { PlaceBaseModel } from '@/models';
import { useDeletePlaceMutation } from '@/services';

import { SiteForm } from '../../common/SiteForm';
import { SiteList } from '../../common/SiteTable';

export const UserSites = () => {
    const [isOpen, toggle] = useToggle();
    const [editableItem, setEditableItem] = useState<PlaceBaseModel | null>(null);

    const [deletePlace] = useDeletePlaceMutation();

    const handleOnDelete = (id: string) => {
        return deletePlace(id);
    };

    const handleOnEdit = (editableItem: PlaceBaseModel) => {
        toggle();
        setEditableItem(editableItem);
    };

    return (
        <div>
            <Row wrap={false} style={{ margin: '16px 0', gap: 8 }}>
                <h2>Ваши площадки</h2>
                <Tooltip title='Добавить плошадку'>
                    <Button onClick={toggle} type='primary' shape='circle' icon={<PlusOutlined />} />
                </Tooltip>
            </Row>
            <SiteList onEdit={handleOnEdit} onDelete={handleOnDelete} />
            <Modal destroyOnClose footer={false} open={isOpen} onCancel={toggle}>
                <SiteForm defaultItem={editableItem} onClose={toggle} />
            </Modal>
        </div>
    );
};
