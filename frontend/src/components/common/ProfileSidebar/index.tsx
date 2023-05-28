import { Layout, Menu, MenuProps } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Avatar } from '@/components';
import { Role } from '@/models';
import {
    useDeleteUserProfilePhotoMutation,
    useGetCurrentUserQuery,
    useUploadUserProfilePhotoMutation,
} from '@/services';

import { landlordItems, tenantItems } from './config';
import s from './style.module.scss';

const { Sider } = Layout;

export const ProfileSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hash = location.hash;

    const { data: currentUser, isLoading } = useGetCurrentUserQuery();

    const [deletePhoto] = useDeleteUserProfilePhotoMutation();
    const [uploadPhoto] = useUploadUserProfilePhotoMutation();

    const handleClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
    };
    const defaultSelectedKeys = [hash.length ? hash : '#me'];
    return (
        <Sider className={s.sider} width={250} breakpoint='lg' collapsedWidth='0'>
            {!isLoading && currentUser && (
                <>
                    <div className={s.profile}>
                        <Avatar
                            url={currentUser?.avatar_thumbnail_url}
                            deletePhoto={deletePhoto}
                            uploadPhoto={uploadPhoto}
                        />
                        <p className={s.name}>
                            {currentUser.name} <br /> {currentUser.surname}
                        </p>
                        <span className={s.role}>{currentUser.role.name}</span>
                    </div>
                    <Menu
                        theme='dark'
                        mode='inline'
                        defaultSelectedKeys={defaultSelectedKeys}
                        items={currentUser?.role.id === Role.Арендатор ? tenantItems : landlordItems}
                        onSelect={handleClick}
                    />
                </>
            )}
        </Sider>
    );
};
