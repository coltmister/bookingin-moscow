import { message, Table } from 'antd';
import React, { useMemo } from 'react';

import {
    useActivateUserMutation,
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
    useVerifyUserMutation,
} from '../../../../services/AdminService/Admin.service';
import { adminProfileColumns } from './columns';
export const AdminProfiles = () => {
    const { data, isLoading } = useGetAllUsersQuery({ itemsPerPage: 1000 });
    const [messageApi, contextHolder] = message.useMessage();

    const [verifyUser] = useVerifyUserMutation();
    const [activate] = useActivateUserMutation();
    const [promote] = useUpdateUserRoleMutation();

    const handleItemsClick = (e, user) => {
        let action = verifyUser;
        if (e.key === 'activate') {
            action = activate;
        }
        if (e.key === 'promote') {
            action = promote;
        }
        action({ user_id: user.id }).then((res) => {
            if ('error' in res) {
                messageApi.error('Ошибка при редактировании пользователя');
            } else {
                messageApi.success('Аккаунт изменен');
            }
        });
    };
    const getColumns = useMemo(() => adminProfileColumns(handleItemsClick), []);

    return (
        <div>
            {contextHolder}
            <Table loading={isLoading} dataSource={data?.payload} columns={getColumns} />
        </div>
    );
};
