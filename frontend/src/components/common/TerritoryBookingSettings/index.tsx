import { Button, Descriptions, Divider, Modal, Row, Tooltip, Typography } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import React from 'react';
import { BiPencil } from 'react-icons/all';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import {
    useGetTerritoryByIdQuery,
    useGetTerritorySettingsByIdQuery,
} from '../../../services/TerritoryService/Territory.service';
import { TerritoryBookingWorkingTimes } from '../TerritoryBookingWorkingTimes';
import { TerritorySettingsForm } from '../TerritorySettingsForm';
export const TerritoryBookingSettings = () => {
    const params = useParams();
    const [isOpen, toggle] = useToggle();

    const { data } = useGetTerritoryByIdQuery(params?.territoryId ?? '', {
        skip: !params?.territoryId,
    });
    const { data: territorySettings, isLoading: isTerritorySettingsLoading } = useGetTerritorySettingsByIdQuery(
        params?.territoryId ?? '',
        {
            skip: !params?.territoryId,
        }
    );

    return (
        <div>
            {data && (
                <>
                    {territorySettings && !isTerritorySettingsLoading && (
                        <div>
                            <Row style={{ margin: '16px 0', gap: 8 }} wrap={false}>
                                <h2>Настройка бронирования</h2>
                                <Tooltip title='Настроить бронирование'>
                                    <Button onClick={toggle} type='primary' shape='circle' icon={<BiPencil />} />
                                </Tooltip>
                            </Row>
                            <Descriptions>
                                {!!territorySettings.duration && (
                                    <DescriptionsItem label={'Длительность сеанса'}>
                                        {territorySettings.duration}
                                    </DescriptionsItem>
                                )}
                                {!!territorySettings.max_slots && (
                                    <DescriptionsItem label={'Макс. количество сеансов'}>
                                        {territorySettings.max_slots}
                                    </DescriptionsItem>
                                )}

                                {territorySettings.external_name && (
                                    <DescriptionsItem label={'Название внешнего календаря '}>
                                        {territorySettings.duration}
                                    </DescriptionsItem>
                                )}
                                {territorySettings.calendar_url && (
                                    <DescriptionsItem label={'Ссылка на внешний календарь'}>
                                        {territorySettings.max_slots}
                                    </DescriptionsItem>
                                )}
                            </Descriptions>
                            {territorySettings.booking_calendar_url && (
                                <Descriptions>
                                    <DescriptionsItem label={'Календарь АртМосфера'}>
                                        <Typography.Paragraph
                                            style={{ width: 300 }}
                                            ellipsis={{ suffix: '.ics' }}
                                            copyable={{
                                                tooltips: ['Нажмите, чтобы скопировать', 'Скопировано'],
                                            }}
                                        >
                                            {territorySettings.booking_calendar_url}
                                        </Typography.Paragraph>
                                    </DescriptionsItem>
                                </Descriptions>
                            )}
                            <Modal footer={false} open={isOpen} onCancel={toggle}>
                                <TerritorySettingsForm defaultItem={territorySettings} onClose={toggle} />
                            </Modal>
                            <Divider />
                            <TerritoryBookingWorkingTimes />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
