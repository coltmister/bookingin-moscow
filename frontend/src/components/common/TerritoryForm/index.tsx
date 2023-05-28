import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Descriptions, Input, message, Row, Select, SelectProps, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { TerritoryModel } from '@/models';
import { useGetPlaceCategoriesQuery } from '@/services';

import { TerritoryFieldsForm } from '../../../services/TerritoryService/Territory.dto';
import {
    useCreateTerritoryMutation,
    useUpdateTerritoryMutation,
} from '../../../services/TerritoryService/Territory.service';
import { territoryValidation } from '../../../utils/lib/territoryValidation';

interface TerritoryFormProps {
    defaultItem: TerritoryModel | null;
    onClose: () => void;
}
export const TerritoryForm = ({ defaultItem, onClose }: TerritoryFormProps) => {
    const params = useParams();

    const [messageApi, contextHolder] = message.useMessage();
    const form = useForm<TerritoryFieldsForm>({ resolver: yupResolver(territoryValidation) });
    const { handleSubmit, setValue, reset } = form;

    const { data, isLoading } = useGetPlaceCategoriesQuery();

    const [createTerritory] = useCreateTerritoryMutation();
    const [updateTerritory] = useUpdateTerritoryMutation();

    useEffect(() => {
        if (defaultItem) {
            let newItem: TerritoryFieldsForm = {} as TerritoryFieldsForm;
            const { category: _category, ...item } = defaultItem;
            newItem = { ...item, category: defaultItem.category.id };
            reset(newItem);
        }
    }, [defaultItem]);
    const onSubmit: SubmitHandler<TerritoryFieldsForm> = async (e) => {
        const action = defaultItem ? updateTerritory : createTerritory;
        if (!defaultItem) {
            e.id = params?.id ?? '';
        }
        try {
            const res = await action(e);
            if ('data' in res) {
                messageApi.success(defaultItem ? 'Успешно обновлено' : 'Территория добавлена');
                onClose();
            } else if ('error' in res) {
                console.log(res);
                //@ts-ignore check error value
                messageApi.error(res?.error?.data || 'Ошибка');
            }
        } catch (e) {
            messageApi.error('Ошибка. Проверьте соединение с Интернетом.');
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}>
                {contextHolder}
                <Descriptions
                    title={defaultItem ? 'Редактировать территорию' : 'Добавить территорию'}
                    layout='vertical'
                >
                    <Descriptions.Item label='Название'>
                        <Controller name='name' render={({ field }) => <Input {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Стоимость за временной слот' span={6}>
                        <Controller name='price' render={({ field }) => <Input {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Краткое описание' span={24}>
                        <Controller name='brief_description' render={({ field }) => <TextArea rows={1} {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Полное описание' span={24}>
                        <Controller name='description' render={({ field }) => <TextArea {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Категория' span={24}>
                        <Controller
                            name='category'
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    style={{ width: '100%' }}
                                    showSearch={true}
                                    options={data}
                                    loading={isLoading}
                                    fieldNames={{ label: 'name', value: 'id' }}
                                />
                            )}
                        />
                    </Descriptions.Item>
                </Descriptions>
                <Row wrap={false}>
                    <Space>
                        <Button onClick={onClose}>Отмена</Button>
                        <Button type={'primary'} htmlType='submit'>
                            Сохранить
                        </Button>
                    </Space>
                </Row>
            </form>
        </FormProvider>
    );
};
