import { Badge, Button, Modal } from 'antd';
import { useState } from 'react';

import { CATEGORIES_COLORS_MAP } from '@/constants';
import { TerritoryModel } from '@/models';
import { Title } from '@/ui';

import { BookingForm } from '../Forms';
import s from './styles.module.scss';
import { useAuth } from '@/hooks';

type TerritoryPlaceCardProps = TerritoryModel;

export const TerritoryPlaceCard = (props: TerritoryPlaceCardProps) => {
    const { image_url, category, name, description, price } = props;
    const { isAuth } = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    const onModalHandler = () => setIsOpen(!isOpen);

    return (
        <>
            <article className={s.card}>
                <img
                    src={image_url ? image_url : '/img/image-placeholder.webp'}
                    alt='Картинка площадки'
                    style={{ objectFit: image_url ? 'cover' : 'contain' }}
                />
                <div className={s.content}>
                    <div className={s.top}>
                        <Badge text={category.name} color={CATEGORIES_COLORS_MAP[category.name]} />
                    </div>
                    <Title className={s.title} level={3}>
                        {name}
                    </Title>
                    <p className={s.descr}>{description}</p>
                    <p className={s.price}>от {price} р/час</p>
                    <Button disabled={!isAuth} size='large' type='primary' block onClick={onModalHandler}>
                        Забронировать
                    </Button>
                </div>
            </article>
            <BookingForm onModalHandler={onModalHandler} isOpen={isOpen} {...props} />
        </>
    );
};
