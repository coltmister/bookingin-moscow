import { message, Table } from 'antd';
import React, { useMemo } from 'react';

import { useGetPlacesQuery } from '@/services';

import {
    useActivatePlaceMutation,
    useBlockPlaceMutation,
    useConfirmPlaceMutation,
} from '../../../../services/AdminService/Admin.service';
import { adminSitesColumns } from '../AdminSites/columns';

export const AdminSites = () => {
    const { data, isLoading } = useGetPlacesQuery({ itemsPerPage: 1000 });
    const [messageApi, contextHolder] = message.useMessage();

    const [activate] = useActivatePlaceMutation();
    const [block] = useBlockPlaceMutation();
    const [confirm] = useConfirmPlaceMutation();

    const handleItemsClick = (e, place) => {
        let action = block;
        if (e.key === 'activate') {
            action = activate;
        }
        if (e.key === 'confirm') {
            action = confirm;
        }
        action({ place_id: place.id }).then((res) => {
            if ('error' in res) {
                messageApi.error('Ошибка при редактировании площадки');
            } else {
                messageApi.success('Площадка изменена');
            }
        });
    };
    const getColumns = useMemo(() => adminSitesColumns(handleItemsClick), []);

    return (
        <div>
            {contextHolder}
            <Table loading={isLoading} dataSource={data?.payload} columns={getColumns} />
        </div>
    );
};
