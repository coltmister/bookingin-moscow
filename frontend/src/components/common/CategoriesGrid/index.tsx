import cn from 'clsx';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import { Grid } from 'swiper';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Category } from '@/components';
import { useIsLarge, useIsMedium } from '@/hooks';
import { useGetPlaceCategoriesQuery } from '@/services';

import { mockCategories } from './mock';
import s from './styles.module.scss';

type CategoriesGridProps = DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;

export const CategoriesGrid = ({ className }: CategoriesGridProps) => {
    const { data: currentCategories } = useGetPlaceCategoriesQuery();
    const isLarge = useIsLarge();
    const isMedium = useIsMedium();

    const slidesPerViewCalculate = () => {
        if (isLarge) return 3;
        if (isMedium) return 2;
        return 1;
    };

    const slidesPerView = slidesPerViewCalculate();

    const renderCategories = currentCategories?.map((category) => ({
        ...category,
        title: category.name,
        image: mockCategories[category.name].image,
        webp: mockCategories[category.name].webp,
    }));

    return (
        <Swiper
            wrapperTag='ul'
            slidesPerView={slidesPerView}
            grid={{ rows: 2, fill: 'row' }}
            spaceBetween={isLarge ? 20 : 8}
            modules={[Grid, Navigation]}
            navigation
            className={cn(s.categories, className)}
        >
            {renderCategories?.map((category) => (
                <SwiperSlide tag='li' key={category.id}>
                    <Category {...category} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
