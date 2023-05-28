import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Descriptions, Input, message, Row, Select, Typography } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { TerritorySettingsRequest } from '../../../services/TerritoryService/Territory.dto';
import {
    useGetTerritorySettingsByIdQuery,
    useUpdateTerritorySettingsByIdMutation,
} from '../../../services/TerritoryService/Territory.service';
import { territorySettingsValidation } from '../../../utils/lib/territoryValidation';

interface TerritorySettingsFormProps {
    defaultItem: TerritorySettingsRequest | null;
    onClose: () => void;
}

export const TerritorySettingsForm = ({ defaultItem, onClose }: TerritorySettingsFormProps) => {
    const params = useParams();

    const [messageApi, contextHolder] = message.useMessage();
    const form = useForm<TerritorySettingsRequest>({ resolver: yupResolver(territorySettingsValidation) });
    const { handleSubmit, reset } = form;

    const [updateTerritorySettings] = useUpdateTerritorySettingsByIdMutation();

    useEffect(() => {
        if (defaultItem) {
            reset(defaultItem);
        }
    }, [defaultItem]);
    const onSubmit: SubmitHandler<TerritorySettingsRequest> = async (e) => {
        const action = updateTerritorySettings;

        e.id = params?.territoryId ?? '';

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
                <Descriptions title={'Настройки территории'} layout='vertical'>
                    <Descriptions.Item label='Длительность сеанса *' span={6}>
                        <Controller name='duration' render={({ field }) => <Input type={'number'} {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Максимальное одновременное количество сеансов *' span={6}>
                        <Controller name='max_slots' render={({ field }) => <Input type={'number'} {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Внешний календарь (ссылка на .cal)' span={24}>
                        <Controller
                            name='calendar_url'
                            render={({ field }) => <Input placeholder={'Введите ссылку'} {...field} />}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label='Название внешнего календаря' span={24}>
                        <Controller
                            name='external_name'
                            render={({ field }) => <Input placeholder={'Введите название календаря'} {...field} />}
                        />
                    </Descriptions.Item>
                </Descriptions>
                <Row wrap={false}>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button type={'primary'} htmlType='submit'>
                        Сохранить
                    </Button>
                </Row>
            </form>
        </FormProvider>
    );
};
