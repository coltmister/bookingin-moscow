import { Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';

import { PlaceCard } from '@/components';
import { useIsLarge, useIsMedium } from '@/hooks';
import { useGetPlacesQuery } from '@/services';
import { Container } from '@/ui';

import s from '../styles.module.scss';

export const MainPagePopular = () => {
    const isLarge = useIsLarge();
    const isMedium = useIsMedium();

    const slidesPerViewCalculate = () => {
        if (isLarge) return 3;
        if (isMedium) return 2;
        return 1;
    };

    const slidesPerView = slidesPerViewCalculate();

    const { data } = useGetPlacesQuery({ rating__gte: 5 });

    return (
        <section className={s.popular}>
            <Container className={s.container}>
                <Typography.Title className={s.title} level={2}>
                    Популярные площадки
                </Typography.Title>
                <Link hidden={!isMedium} to='/places' className={s.popular}>
                    Посмотреть все
                </Link>
            </Container>
            <Container>
                <Swiper spaceBetween={20} slidesPerView={slidesPerView} className={s.slider} wrapperTag='ul'>
                    {data?.payload?.map((place) => (
                        <SwiperSlide key={place.id} tag='li'>
                            <PlaceCard key={place.id} {...place} title={place.name} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Container>
            <Container hidden={isMedium}>
                <Link to='/places' className={s.popular}>
                    Посмотреть все
                </Link>
            </Container>
        </section>
    );
};
