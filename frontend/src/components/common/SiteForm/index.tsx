import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Descriptions, Input, message, Row, Select, SelectProps } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { isObject } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useDebounce } from 'usehooks-ts';

import { PlaceBaseModel } from '@/models';
import {
    useCreatePlaceMutation,
    useGetAddressSuggestsQuery,
    useGetStationsListQuery,
    useUpdatePlaceMutation,
} from '@/services';
import { filterOption, siteValidation } from '@/utils';

import { PlaceTransformedSuggest } from '../../../services/PlacesService/Places.dto';

const { Option } = Select;

interface SiteFormProps {
    defaultItem: PlaceBaseModel | null;
    onClose: () => void;
}

export const SiteForm = ({ defaultItem, onClose }: SiteFormProps) => {
    const [messageApi, contextHolder] = message.useMessage();
    const form = useForm<PlaceBaseModel>({ resolver: yupResolver(siteValidation) });
    const { handleSubmit, setValue, reset, watch } = form;
    const [addressSearch, setAddressSearch] = useState<string>('');

    const debouncedValue = useDebounce<string>(addressSearch, 500);

    const handleChange = (value: string) => {
        setAddressSearch(value);
    };

    const [createPlace] = useCreatePlaceMutation();
    const [updatePlace] = useUpdatePlaceMutation();
    const { data: addresses, isLoading } = useGetAddressSuggestsQuery(debouncedValue, { skip: !debouncedValue });
    const { data: stations, isFetching: isStationsFetching } = useGetStationsListQuery();

    useEffect(() => {
        if (defaultItem) {
            const { underground, ...newItem } = defaultItem;
            newItem.underground = { value: defaultItem.underground?.id, label: defaultItem.underground?.name };
            reset(newItem);
        }
    }, [defaultItem]);
    const onSubmit: SubmitHandler<PlaceBaseModel> = async (e) => {
        const action = defaultItem ? updatePlace : createPlace;
        //Временно
        e.landing = {};
        try {
            const res = await action(e);
            if ('data' in res) {
                messageApi.success(defaultItem ? 'Успешно обновлено' : 'Площадка добавлена');
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

    const handleChangeAddress: SelectProps<string, PlaceTransformedSuggest>['onChange'] = (value, option) => {
        if (isObject(option) && 'value' in option) {
            setValue('address', option.value);
            setValue('coords', option.coords);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}>
                {contextHolder}
                <Descriptions title={defaultItem ? 'Редактировать площадку' : 'Добавить площадку'} layout='vertical'>
                    <Descriptions.Item label='Название *'>
                        <Controller name='name' render={({ field }) => <Input {...field} />} />
                    </Descriptions.Item>

                    <Descriptions.Item label='Веб-сайт *'>
                        <Controller name='url' render={({ field }) => <Input {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Email *'>
                        <Controller name='email' render={({ field }) => <Input {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Краткое описание *' span={24}>
                        <Controller name='brief_description' render={({ field }) => <TextArea {...field} />} />
                    </Descriptions.Item>
                    <Descriptions.Item label='Адрес *' span={24}>
                        <Controller
                            name='address'
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    style={{ width: '100%' }}
                                    onSearch={handleChange}
                                    showSearch={true}
                                    options={addresses}
                                    loading={isLoading}
                                    filterOption={() => true}
                                    onChange={handleChangeAddress}
                                />
                            )}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label='Метро *' span={24}>
                        <Controller
                            name='underground'
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    style={{ width: '100%' }}
                                    showSearch
                                    loading={isStationsFetching}
                                    allowClear
                                    filterOption={filterOption}
                                >
                                    {stations?.map((el) => (
                                        <Option key={el.id} value={el.id.toString()}>
                                            {el.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
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
