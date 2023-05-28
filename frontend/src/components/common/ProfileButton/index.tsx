import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown } from 'antd';
import { isString } from 'lodash-es';
import React, { DetailedHTMLProps, HTMLAttributes, useId, useMemo } from 'react';

import { useAuth, useIsLarge } from '@/hooks';
import { useGetCurrentUserQuery } from '@/services';
import { isMenuType } from '@/type-guards';
import { authorize } from '@/utils';

import { items } from './config';
import s from './styles.module.scss';

interface ProfileButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    isLoading?: boolean;
}
export const ProfileButton = ({ isLoading, ...props }: ProfileButtonProps) => {
    const { isAuth } = useAuth();
    const isLarge = useIsLarge();
    const { data } = useGetCurrentUserQuery();

    console.log('user', data);

    const handleLogin = () => {
        authorize();
    };

    const id = useId();

    const getMenuItems = useMemo(() => items(data?.role.id), [data?.role.id]);

    return (
        <>
            {isAuth && (
                <>
                    <Dropdown
                        className={s.avatar}
                        menu={{ items: getMenuItems }}
                        placement='top'
                        arrow
                        getPopupContainer={(node) => node}
                        trigger={['click']}
                    >
                        <Avatar key={id} size='large' src={data?.avatar_thumbnail_url} icon={<UserOutlined />} />
                    </Dropdown>

                    {getMenuItems?.filter(isMenuType).map((item) => {
                        return (
                            !isString(item?.label) && (
                                <div hidden={isLarge} key={item.key}>
                                    {item?.label}
                                </div>
                            )
                        );
                    })}
                </>
            )}
            {!isAuth && (
                <Button hidden={isLoading} type='primary' onClick={handleLogin}>
                    Вход / Регистрация
                </Button>
            )}
        </>
    );
};
