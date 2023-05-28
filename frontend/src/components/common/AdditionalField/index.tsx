import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Descriptions, Input, message, Row, Select, Typography } from 'antd';
import Checkbox from 'antd/es/checkbox/Checkbox';
import DescriptionsItem from 'antd/es/descriptions/Item';
import { isBoolean } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { BiCheck, BiPencil, BiTrash, CgClose } from 'react-icons/all';
import { useParams } from 'react-router-dom';

import { AdditionalFieldTerritoryValue, ManageAdditionalField } from '../../../services/TerritoryService/Territory.dto';
import {
    useCreateTerritoryAdditionalFieldsMutation,
    useDeleteTerritoryAdditionalFieldsMutation,
    useEditTerritoryAdditionalFieldsMutation,
    useGetAdditionalFieldsQuery,
    useGetTerritoryByIdQuery,
} from '../../../services/TerritoryService/Territory.service';
import { territoryAdditionalFieldValidation } from '../../../utils/lib/territoryValidation';
import s from './style.module.scss';
export interface AdditionalFieldProps {
    isDefaultEditable: boolean;
    onCancelCreate?: () => void;
    defaultValue?: AdditionalFieldTerritoryValue;
}

const generateDefaultValues = (territory_id: string, defaultValue?: AdditionalFieldTerritoryValue) => {
    if (defaultValue) {
        return {
            value_id: defaultValue.id,
            territory_id,
            add_field: defaultValue.add_field.id,
            value: defaultValue.value,
        };
    }
    return {
        territory_id,
        add_field: null,
        value: null,
    };
};

export const AdditionalField = ({ isDefaultEditable, onCancelCreate, defaultValue }: AdditionalFieldProps) => {
    const [messageApi, contextHolder] = message.useMessage();

    const params = useParams();
    const territory_id = params?.territoryId ?? '';
    const [isEditing, setIsEditing] = useState(isDefaultEditable);
    const form = useForm({
        defaultValues: generateDefaultValues(territory_id, defaultValue),
        resolver: yupResolver(territoryAdditionalFieldValidation),
    });

    const { data: territory } = useGetTerritoryByIdQuery(territory_id, { skip: !territory_id });
    const { data: additionalFieldsOptions } = useGetAdditionalFieldsQuery(territory?.category?.id, {
        skip: !territory?.category?.id,
    });
    const [deleteItem] = useDeleteTerritoryAdditionalFieldsMutation();
    const [createItem] = useCreateTerritoryAdditionalFieldsMutation();
    const [updateItem] = useEditTerritoryAdditionalFieldsMutation();

    const handleDelete = async () => {
        try {
            const res = await deleteItem({ territory_id, value_id: defaultValue.id });
            if ('data' in res) {
                messageApi.success('Поле удалено');
            } else if ('error' in res) {
                //@ts-ignore check error value
                messageApi.error(res?.error?.data || 'Ошибка');
            }
        } catch (e) {
            messageApi.error('Ошибка. Проверьте соединение с Интернетом.');
        }
    };

    const onSubmit: SubmitHandler<ManageAdditionalField> = (e) => {
        const action = defaultValue ? updateItem : createItem;
        if (e.value === 'true') {
            e.value = true;
        }
        if (e.value === 'false') {
            e.value = false;
        }
        action(e).then((res) => {
            if ('data' in res) {
                onCancelCreate();
                messageApi.success('Поле добавлено');
            } else {
                messageApi.success('Поле удалено');
            }
        });
    };

    const selectedFieldId = form.watch('add_field');

    const dynamicField = useMemo(
        () => additionalFieldsOptions?.find(({ id }) => id === selectedFieldId),
        [selectedFieldId, additionalFieldsOptions]
    );

    const optionsForDynamicSelect = useMemo(
        () => (dynamicField?.choices && dynamicField?.choices.map((title) => ({ label: title, value: title }))) ?? [],
        [dynamicField]
    );

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {contextHolder}
            {!isEditing && (
                <Row className={s.field}>
                    <Descriptions>
                        <DescriptionsItem className={s.field} label={defaultValue.add_field.name}>
                            <Row style={{ gap: 24 }}>
                                {isBoolean(defaultValue.value) ? (
                                    defaultValue.value ? (
                                        <BiCheck size={24} />
                                    ) : (
                                        <CgClose size={24} />
                                    )
                                ) : (
                                    <Typography.Text style={{ fontSize: 20 }}>{defaultValue.value}</Typography.Text>
                                )}
                                <Row style={{ alignItems: 'center' }} gutter={8}>
                                    <Button
                                        size={'small'}
                                        type='text'
                                        onClick={() => setIsEditing(true)}
                                        icon={<BiPencil />}
                                    />
                                    <Button size={'small'} type='text' onClick={handleDelete} icon={<BiTrash />} />
                                </Row>{' '}
                            </Row>
                        </DescriptionsItem>
                    </Descriptions>
                </Row>
            )}
            {isEditing && additionalFieldsOptions && (
                <Row>
                    <Descriptions column={{ lg: 3, md: 1, sm: 1, xs: 1 }}>
                        <DescriptionsItem label={'Критерий'}>
                            <Controller
                                control={form.control}
                                render={({ field }) => (
                                    <Select
                                        fieldNames={{ value: 'id', label: 'name' }}
                                        options={additionalFieldsOptions}
                                        style={{ width: 200 }}
                                        {...field}
                                    />
                                )}
                                name={'add_field'}
                            />
                        </DescriptionsItem>
                        {dynamicField && (
                            <DescriptionsItem label={'Значение'}>
                                <Controller
                                    render={({ field }) => (
                                        <>
                                            {dynamicField.type === 1 && <Checkbox {...field} style={{ width: 200 }} />}
                                            {dynamicField.type === 2 && (
                                                <Select
                                                    {...field}
                                                    style={{ width: 200 }}
                                                    options={optionsForDynamicSelect}
                                                />
                                            )}
                                            {dynamicField.type === 3 && (
                                                // @ts-ignore Пофиг
                                                <Input {...field} style={{ width: 200 }} type={'number'} />
                                            )}
                                        </>
                                    )}
                                    control={form.control}
                                    name={'value'}
                                />
                            </DescriptionsItem>
                        )}
                        <DescriptionsItem>
                            <Row gutter={8}>
                                {dynamicField && (
                                    <Button type='text' htmlType={'submit'} icon={<BiCheck />}>
                                        Сохранить
                                    </Button>
                                )}
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
