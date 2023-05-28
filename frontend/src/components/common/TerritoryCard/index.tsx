import { EllipsisOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Alert, Card, Descriptions, Dropdown, Input, MenuProps, message, Modal, Row, Tag, Typography } from 'antd';
import React, { useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import { Link, useNavigate } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { CATEGORIES_COLORS_MAP } from '@/constants';
import { TerritoryModel } from '@/models';
import { useChangeSubdomainMutation, useToggleActivatePlaceMutation } from '@/services';

import s from './style.module.scss';
const { confirm } = Modal;

const { Meta } = Card;

export interface TerritoryCardProps {
    territory: TerritoryModel;
    onDelete: (id: string) => void;
    onEdit: (item: TerritoryModel) => void;
}

export const TerritoryCard = ({ territory, onDelete, onEdit }: TerritoryCardProps) => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const [isSubdomainOpen, toggle] = useToggle();
    //@ts-ignore check error value
    const [subDomain, setSubdomain] = useState<string>(territory.subdomain ?? '');
    const showDeleteConfirm = () => {
        confirm({
            title: 'Вы точно хотите удалить территорию?',
            icon: <ExclamationCircleFilled />,
            content: 'Действие отменить нельзя',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                return onDelete(territory.id || '');
            },
        });
    };

    const [createSubdomain, { isLoading }] = useChangeSubdomainMutation();

    const [toggleActivateMutation] = useToggleActivatePlaceMutation();

    const getDropdownItems = () => {
        const items = [];
        items.push({ label: 'Редактировать', key: 'edit' });
        items.push({ label: 'Удалить', key: 'delete' });
        return items;
    };

    const handleDropdownClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'edit') {
            onEdit(territory);
        }
        if (e.key === 'delete') {
            showDeleteConfirm();
        }
    };

    const handleCreateSubdomain = async () => {
        createSubdomain({ id: territory.id || '', subdomain: subDomain })
            .then((res) => {
                if ('data' in res) {
                    toggle();
                    message.success('Субдомен создан');
                } else {
                    //@ts-ignore check error value
                    message.error(res.error.data.message);
                }
            })
            .catch(() => {
                message.error('Ошибка при создании субдомена');
            });
    };

    return (
        <>
            {contextHolder}
            <Card
                style={{ width: 300, height: 'fit-content' }}
                actions={[
                    <Dropdown key={'1'} menu={{ items: getDropdownItems(), onClick: handleDropdownClick }}>
                        <EllipsisOutlined key='ellipsis' />
                    </Dropdown>,
                    <Link key={'link'} to={`/site-manage/${territory?.site.id}/territory/${territory.id}`}>
                        <BiChevronRight style={{ width: '100%' }} size={20} key={'2'} />
                    </Link>,
                ]}
            >
                <Meta
                    title={
                        <div style={{ alignItems: 'center', gap: 4 }}>
                            <Typography.Text style={{ fontSize: 16 }}>{territory.name}</Typography.Text>
                            <br />
                            <Tag color={CATEGORIES_COLORS_MAP[territory.category.name]}>{territory.category.name}</Tag>
                        </div>
                    }
                    description={territory.brief_description}
                />
            </Card>
            <Modal
                open={isSubdomainOpen}
                onCancel={toggle}
                destroyOnClose
                onOk={handleCreateSubdomain}
                confirmLoading={isLoading}
                title={'Зарегистрируйте поддомен'}
            >
                <Alert
                    type={'info'}
                    style={{ margin: '8px 0' }}
                    description={'Красивый и запоминающийся домен выделит вашу площадку среди конкурентов'}
                />
                <Descriptions layout='vertical'>
                    <Descriptions.Item label='Введите поддомен'>
                        <Input
                            addonAfter='.bookingin.moscow'
                            value={subDomain}
                            onChange={(e) => setSubdomain(e.target.value)}
                        />
                    </Descriptions.Item>
                </Descriptions>
            </Modal>
        </>
    );
};
