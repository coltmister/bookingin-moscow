import { EditOutlined, EllipsisOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Descriptions,
    Dropdown,
    Input,
    MenuProps,
    message,
    Modal,
    Row,
    Tooltip,
    Typography,
    Upload,
    UploadProps,
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { isNull } from 'lodash-es';
import React, { useState } from 'react';
import { BiChevronRight, BiTimeFive, BsCheckLg, HiOutlineChatBubbleOvalLeft } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { PlaceBaseModel, PlaceModel } from '@/models';
import { useChangeSubdomainMutation, useToggleActivatePlaceMutation } from '@/services';

import s from './style.module.scss';

const { confirm } = Modal;

const { Meta } = Card;

export interface SiteCardProps {
    site: PlaceModel;
    onDelete: (id: string) => void;
    onEdit: (item: PlaceBaseModel) => void;
}

export const SiteCard = ({ site, onDelete, onEdit }: SiteCardProps) => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const [isSubdomainOpen, toggle] = useToggle();
    //@ts-ignore check error value
    const [subDomain, setSubdomain] = useState<string>(site.subdomain ?? '');
    const showDeleteConfirm = () => {
        confirm({
            title: 'Вы точно хотите удалить площадку?',
            icon: <ExclamationCircleFilled />,
            content: 'Действие отменить нельзя',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                return onDelete(site.id || '');
            },
        });
    };

    const [createSubdomain, { isLoading }] = useChangeSubdomainMutation();

    const [toggleActivateMutation] = useToggleActivatePlaceMutation();

    const getDropdownItems = () => {
        const items = [];
        //@ts-ignore check value
        if (!site.is_confirmed) {
            items.push({ label: 'Добавить поддомен', key: 'domain' });
            items.push({ label: 'Редактировать', key: 'edit' });
        }

        items.push({ label: site.is_active ? 'Деактивировать' : 'Активировать', key: 'activation' });
        items.push({ label: 'Удалить', key: 'delete' });
        return items;
    };

    const getConfirmStatus = () => {
        if (isNull(site.is_confirmed)) {
            return <BiTimeFive color={'orange'} />;
        }
        if (site.is_confirmed) {
            return <BsCheckLg color='#4caf50' />;
        }
        return <HiOutlineChatBubbleOvalLeft color='red' />;
    };

    const handleDropdownClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'domain') {
            toggle();
        }
        if (e.key === 'activation' && site.id) {
            toggleActivateMutation(site.id);
        }
        if (e.key === 'delete') {
            showDeleteConfirm();
        }
        if (e.key === 'edit') {
            onEdit(site);
        }
    };

    const generateTooltip = () => {
        const defaultMessage = isNull(site.is_confirmed)
            ? 'На модерации'
            : site.is_confirmed
            ? 'Подтверждена'
            : 'Отклонена';
        return <Tooltip title={site.admin_message ? site.admin_message : defaultMessage}>{getConfirmStatus()}</Tooltip>;
    };

    const handleCreateSubdomain = async () => {
        createSubdomain({ id: site.id || '', subdomain: subDomain })
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

    const handleCardClick = () => {
        navigate('/site-manage/' + site?.id);
    };
    return (
        <>
            {contextHolder}
            <Card
                style={{ width: 300, height: 'fit-content' }}
                cover={
                    <img
                        alt={'Обложка'}
                        style={{ height: 150, objectFit: 'cover' }}
                        src={
                            site.image_url ??
                            'https://i0.wp.com/roadmap-tech.com/wp-content/uploads/2019/04/placeholder-image.jpg'
                        }
                    />
                }
                actions={[
                    <Dropdown key={'1'} menu={{ items: getDropdownItems(), onClick: handleDropdownClick }}>
                        <EllipsisOutlined style={{ width: '100%' }} size={20} key='ellipsis' />
                    </Dropdown>,
                    <BiChevronRight
                        style={{ width: '100%' }}
                        size={20}
                        key={'2'}
                        type={'text'}
                        onClick={handleCardClick}
                    />,
                ]}
            >
                <Meta
                    title={
                        <Row style={{ alignItems: 'center', gap: 4 }}>
                            <Typography.Text disabled={!site.is_active}>{site.name}</Typography.Text>
                            {generateTooltip()}
                        </Row>
                    }
                    description={site.brief_description}
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
