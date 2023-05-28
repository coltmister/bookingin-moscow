import { Button, DatePicker, Select as AntSelect } from 'antd';
import dayjs from 'dayjs';
import { isNil, omitBy } from 'lodash-es';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { MdSearch } from 'react-icons/md';

import { DEFAULT_DATE_FORMAT } from '@/constants';
import { useRouter } from '@/hooks';
import { useGetPlaceCategoriesQuery, useGetStationsListQuery } from '@/services';
import { Container, Row, Select } from '@/ui';
import { filterOption, serialize } from '@/utils';

import s from './styles.module.scss';

const { Option } = AntSelect;

export const SearchEntity = () => {
    const form = useForm();
    const { history } = useRouter();
    const { data: categories, isFetching: isCategoriesFetching } = useGetPlaceCategoriesQuery();
    const { data: stations, isFetching: isStationsFetching } = useGetStationsListQuery();

    const onSubmit = form.handleSubmit((data) => {
        const date = dayjs(data.available_date).format('YYYY-MM-DD');
        const query = serialize(
            omitBy(
                {
                    territories__category: data.territories__category,
                    underground: data.underground,
                    available_date: date,
                },
                isNil
            )
        );
        history('/places?' + query);
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={onSubmit}>
                <Container className={s.container}>
                    <Row lg={4} md={8}>
                        <Controller
                            name='territories__category'
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    size='large'
                                    allowClear
                                    placeholder='Категории'
                                    loading={isCategoriesFetching}
                                    showSearch
                                    filterOption={filterOption}
                                >
                                    {categories?.map((el) => (
                                        <Option key={el.id} value={el.id.toString()}>
                                            {el.name}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Row>
                    <Row lg={3} md={8}>
                        <Controller
                            name='underground'
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    size='large'
                                    placeholder='Станция метро'
                                    loading={isStationsFetching}
                                    allowClear
                                    showSearch
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
                    </Row>
                    <Row lg={3} md={8}>
                        <Controller
                            name='available_date'
                            render={({ field }) => (
                                <DatePicker {...field} format={DEFAULT_DATE_FORMAT} size='large' placeholder='Когда' />
                            )}
                        />
                    </Row>
                    <Row lg={2} md={8}>
                        <Button htmlType='submit' size='large' type='primary' icon={<MdSearch />}>
                            Искать
                        </Button>
                    </Row>
                </Container>
            </form>
        </FormProvider>
    );
};
