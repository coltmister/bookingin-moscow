import { Badge, Typography } from 'antd';
import cn from 'clsx';
import { DetailedHTMLProps, ElementType, HTMLAttributes } from 'react';
import { AiFillStar, BsFillGeoAltFill } from 'react-icons/all';
import { Link } from 'react-router-dom';

import { CATEGORIES_COLORS_MAP, METRO_MAP } from '@/constants';
import { CategoryModel, PlaceModel } from '@/models';

import s from './styles.module.scss';

interface PlaceCardProps<T extends ElementType>
    extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>,
        PlaceModel {
    as?: T;
    categories?: CategoryModel[];
}

export const PlaceCard = <T extends ElementType = 'div'>({
    as,
    image_url,
    title,
    className,
    categories,
    children,
    address,
    id,
    brief_description,
    underground,
    rating,
}: PlaceCardProps<T>) => {
    const Wrapper = as || 'div';

    return (
        <Wrapper className={cn(s.card, className)}>
            <Link className={s.link} to={`/place/${id}`}>
                <div className={cn(s.imageContainer, { [s.hasImage]: image_url })}>
                    <img src={image_url ?? '/img/image-placeholder.webp'} alt='Карточка' />
                </div>
                <div className={s.content}>
                    <div className={s.spacer}>
                        {categories?.map((category) => (
                            <Badge
                                key={category.id}
                                color={CATEGORIES_COLORS_MAP[category.name]}
                                text={category.name}
                            />
                        ))}
                    </div>
                    <div className={s.top}>
                        <Typography.Title className={s.title} level={3}>
                            {title}
                        </Typography.Title>

                        <div hidden={!rating} className={s.rating}>
                            {rating}
                            <AiFillStar />
                        </div>
                    </div>
                    <address className={s.address}>
                        <Typography.Paragraph className={s.location}>
                            <BsFillGeoAltFill />
                            {address}
                        </Typography.Paragraph>
                        <Typography.Paragraph
                            hidden={!underground}
                            className={s.metro}
                            style={{ '--color': METRO_MAP[underground?.line] }}
                        >
                            {underground?.name}
                        </Typography.Paragraph>
                    </address>
                    <Typography.Paragraph className={s.brief}>{brief_description}</Typography.Paragraph>
                    {children}
                </div>
            </Link>
        </Wrapper>
    );
};
