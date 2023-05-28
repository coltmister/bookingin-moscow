import { Avatar, Button, Descriptions, Divider, Row } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { BiCheck, FcDocument, GiTick } from 'react-icons/all';

import { BookingModel, BookingService } from '@/models';

import { AdditionalField } from '../../../../services/TerritoryService/Territory.dto';
import { timeSlotsToString } from '../../../../utils/lib/timeSlotsToString';
import { AdditionalServiceField } from '../../AdditionalServiceField';
import { BookingStatus } from '../../BookingStatus';
export interface CalendarModalProps {
    bookingItem: BookingModel;
}
export const CalendarModal = ({ bookingItem }: CalendarModalProps) => {
    return (
        <div>
            <Row style={{ alignItems: 'center', gap: 16 }}>
                <Avatar
                    alt={'Аватар'}
                    src={bookingItem.tenant.avatar_url}
                    style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 100, margin: '8px 0' }}
                />
                <div>
                    <h3>{`${bookingItem.tenant.surname} ${bookingItem.tenant.name} ${bookingItem.tenant.patronymic}`}</h3>

                    <BookingStatus status={bookingItem.status} type={'tag'} />
                </div>
            </Row>
            <Divider />
            <Descriptions>
                <DescriptionsItem label={'Площадка'}>{bookingItem.site.name}</DescriptionsItem>
            </Descriptions>
            <Descriptions>
                <DescriptionsItem label={'Территория'}>{bookingItem.territory.name}</DescriptionsItem>
            </Descriptions>
            <Descriptions>
                <DescriptionsItem label={'Дата'}>
                    {dayjs(bookingItem.date).locale('ru').format('D MMMM YYYY')}
                </DescriptionsItem>
            </Descriptions>
            <Descriptions>
                <DescriptionsItem label={'Слоты'}>
                    {timeSlotsToString(bookingItem.time_slots).join('; ')}
                </DescriptionsItem>
            </Descriptions>
            {!!bookingItem.services?.length && (
                <>
                    <Divider />
                    <p style={{ fontWeight: 500 }}>Услуги</p>
                    {bookingItem.services.map((item) => (
                        <Descriptions key={item.service.id}>
                            <DescriptionsItem label={item.service.name}>
                                {item.is_picked ? <BiCheck /> : item.units}
                            </DescriptionsItem>
                        </Descriptions>
                    ))}
                </>
            )}
            <Divider />

            {bookingItem.offer_url && (
                <Button
                    style={{ width: 'fit-content', margin: '8px 0' }}
                    type={'text'}
                    size={'middle'}
                    href={bookingItem.offer_url}
                    icon={<FcDocument />}
                >
                    Скачать оферту
                </Button>
            )}
        </div>
    );
};
