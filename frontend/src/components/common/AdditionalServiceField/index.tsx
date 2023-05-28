import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Descriptions, Input, message, Row, Select, Typography } from 'antd';
import Checkbox from 'antd/es/checkbox/Checkbox';
import DescriptionsItem from 'antd/es/descriptions/Item';
import TextArea from 'antd/es/input/TextArea';
import { isBoolean } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { BiCheck, BiPencil, BiTrash, CgClose } from 'react-icons/all';
import { useParams } from 'react-router-dom';

import {
    AdditionalFieldTerritoryValue,
    CreateTerritoryAdditionalService,
    EditTerritoryAdditionalService,
    ManageAdditionalField,
    ServiceFieldType,
    TerritoryAdditionalServices,
} from '../../../services/TerritoryService/Territory.dto';
import {
    useCreateTerritoryAdditionalServicesMutation,
    useDeleteTerritoryAdditionalServicesMutation,
    useEditTerritoryAdditionalServicesMutation,
    useGetTerritoryByIdQuery,
} from '../../../services/TerritoryService/Territory.service';
import { territoryAdditionalServiceValidation } from '../../../utils/lib/territoryValidation';
import s from './style.module.scss';

export interface AdditionalServiceFieldProps {
    isDefaultEditable: boolean;
    onCancelCreate?: () => void;
    defaultValue?: TerritoryAdditionalServices;
}

const defaultTypes = [
    {
        label: 'Количество',
        value: 'quantitative' as unknown as ServiceFieldType,
    },
    {
        label: 'Наличие',
        value: 'bool' as unknown as ServiceFieldType,
    },
];

const generateDefaultValues = (territory_id: string, defaultValue?: TerritoryAdditionalServices) => {
    if (defaultValue) {
        return {
            service_id: defaultValue.id,
            territory_id,
            name: defaultValue.name,
            description: defaultValue.description,
            type: defaultValue.type.id as ServiceFieldType,
            max_count: defaultValue.max_count,
            is_active: defaultValue.is_active,
        } as EditTerritoryAdditionalService;
    }
    return {
        territory_id,
        name: null,
        description: null,
        type: null,
        max_count: null,
        is_active: true,
    } as CreateTerritoryAdditionalService;
};

export const AdditionalServiceField = ({
    isDefaultEditable,
    onCancelCreate,
    defaultValue,
}: AdditionalServiceFieldProps) => {
    const [messageApi, contextHolder] = message.useMessage();

    const params = useParams();
    const territory_id = params?.territoryId ?? '';
    const [isEditing, setIsEditing] = useState(isDefaultEditable);
    const form = useForm<CreateTerritoryAdditionalService | EditTerritoryAdditionalService>({
        defaultValues: generateDefaultValues(territory_id, defaultValue),
        resolver: yupResolver(territoryAdditionalServiceValidation),
    });

    const { data: territory } = useGetTerritoryByIdQuery(territory_id, { skip: !territory_id });

    const [deleteItem] = useDeleteTerritoryAdditionalServicesMutation();
    const [createItem] = useCreateTerritoryAdditionalServicesMutation();
    const [updateItem] = useEditTerritoryAdditionalServicesMutation();

    const handleDelete = async () => {
        try {
            const res = await deleteItem({ territory_id, service_id: defaultValue.id });
            if (!('error' in res)) {
                messageApi.success('Услуга удалена');
            } else if ('error' in res) {
                //@ts-ignore check error value
                messageApi.error(res?.error?.data || 'Ошибка');
            }
        } catch (e) {
            messageApi.error('Ошибка. Проверьте соединение с Интернетом.');
        }
    };

    const onSubmit: SubmitHandler<CreateTerritoryAdditionalService | EditTerritoryAdditionalService> = (e) => {
        const action = defaultValue ? updateItem : createItem;

        action(e).then((res) => {
            if ('error' in res) {
                messageApi.success('Ошибка');
            } else {
                onCancelCreate && onCancelCreate();
                setIsEditing(false);
                messageApi.success('Услуга сохранена');
            }
        });
    };

    const selectedFieldType = form.watch('type');

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {contextHolder}
            {!isEditing && (
                <div
                    className={s.field}
                    style={{
                        borderRadius: 8,
                        padding: 12,
                        margin: '8px 0',
                        backgroundColor: 'white',
                    }}
                >
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ maxWidth: 250, minWidth: 150 }}>
                            <p style={{ opacity: 0.7 }}>Название</p>
                            <p>{defaultValue.name}</p>
                        </div>
                        <div style={{ maxWidth: 250, minWidth: 150 }}>
                            <p style={{ opacity: 0.7 }}>Тип</p>
                            <p>{defaultValue.type.name}</p>
                        </div>
                        {defaultValue.type.id === ('quantitative' as unknown as ServiceFieldType) && (
                            <div style={{ maxWidth: 250, minWidth: 150 }}>
                                <p style={{ opacity: 0.7 }}>Ограничение (шт.)</p>
                                <p>{defaultValue.max_count}</p>
                            </div>
                        )}
                        <div style={{ maxWidth: 250, minWidth: 150 }}>
                            <p style={{ opacity: 0.7 }}>Услуга активна</p>
                            <p>{defaultValue.is_active ? <BiCheck size={24} /> : <CgClose size={24} />}</p>
                        </div>
                    </div>
                    <div style={{ maxWidth: 300 }}>
                        <p style={{ opacity: 0.7 }}>Описание</p>
                        <p>{defaultValue.description}</p>
                    </div>
                    <Row
                        style={{ alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.1)' }}
                        gutter={8}
                    >
                        <Button size={'small'} type='text' onClick={() => setIsEditing(true)} icon={<BiPencil />}>
                            Редактировать
                        </Button>
                        <Button size={'small'} type='text' onClick={handleDelete} icon={<BiTrash />}>
                            Удалить
                        </Button>
                    </Row>
                </div>
            )}
            {isEditing && (
                <Row
                    style={{
                        borderRadius: 8,
                        padding: 12,
                        margin: '8px 0',
                        backgroundColor: 'white',
                    }}
                >
                    <Descriptions column={{ lg: 3, md: 1, sm: 1, xs: 1 }}>
                        <DescriptionsItem label={'Название'}>
                            <Controller
                                control={form.control}
                                render={({ field }) => <Input style={{ width: 200 }} {...field} />}
                                name={'name'}
                            />
                        </DescriptionsItem>
                        <DescriptionsItem label={'Тип'}>
                            <Controller
                                control={form.control}
                                render={({ field }) => (
                                    <Select options={defaultTypes} style={{ width: 200 }} {...field} />
                                )}
                                name={'type'}
                            />
                        </DescriptionsItem>
                        {/** @ts-ignore Долбанный enum **/}
                        {selectedFieldType === 'quantitative' ? (
                            <DescriptionsItem label={'Ограничение'}>
                                <Controller
                                    render={({ field }) => (
                                        // @ts-ignore Пофиг
                                        <Input {...field} style={{ width: 200 }} type={'number'} />
                                    )}
                                    control={form.control}
                                    name={'max_count'}
                                />
                            </DescriptionsItem>
                        ) : (
                            <DescriptionsItem>
                                <></>
                            </DescriptionsItem>
                        )}

                        <DescriptionsItem span={6} label={'Описание'}>
                            <Controller
                                render={({ field }) => <TextArea cols={3} {...field} style={{ width: '100%' }} />}
                                name={'description'}
                                control={form.control}
                            />
                        </DescriptionsItem>

                        <DescriptionsItem>
                            <Row gutter={8}>
                                <Button
                                    disabled={!form.formState.isValid}
                                    type='text'
                                    htmlType={'submit'}
                                    icon={<BiCheck />}
                                >
                                    Сохранить
                                </Button>
                                {!defaultValue && (
                                    <Button type='text' onClick={onCancelCreate} icon={<CgClose />}>
                                        Отменить
                                    </Button>
                                )}
                            </Row>
                        </DescriptionsItem>
                    </Descriptions>
                </Row>
            )}
        </form>
    );
};
