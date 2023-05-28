import { ClockCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { BsTelephoneFill, IoLinkOutline, IoMail, IoPhoneLandscape } from 'react-icons/all';

import s from './styles.module.scss';

interface AdditionalInfoProps {
    startTime: string;
    endTime: string;
    link: string;
    email: string;
    phone?: string | null;
}

export const AdditionalInfo = ({ startTime, endTime, link, phone, email }: AdditionalInfoProps) => {
    return (
        <ul className={s.additional}>
            <li className={s.item} hidden={!startTime || !endTime}>
                <div className={s.additionalIcon}>
                    <ClockCircleOutlined />
                </div>
                <div className={s.schedule}>
                    <span>Режим работы</span>
                    <span>
                        {startTime?.replace(':00:00', ':00')} - {endTime?.replace(':00:00', ':00')}
                    </span>
                </div>
            </li>
            <li className={s.item} hidden={!link}>
                <div className={s.additionalIcon}>
                    <IoLinkOutline />
                </div>
                <div className={s.schedule}>
                    <Button target='_blank' type='link' href={link}>
                        Перейти на сайт
                    </Button>
                </div>
            </li>
            <li className={s.item} hidden={!email}>
                <div className={s.additionalIcon}>
                    <IoMail />
                </div>
                <div className={s.schedule}>
                    <Button type='link' href={`mailto:${email}`}>
                        {email}
                    </Button>
                </div>
            </li>
            <li className={s.item} hidden={!phone}>
                <div className={s.additionalIcon}>
                    <BsTelephoneFill />
                </div>
                <div className={s.schedule}>
                    <Button type='link' href={phone ?? ''}>
                        {phone}
                    </Button>
                </div>
            </li>
        </ul>
    );
};
