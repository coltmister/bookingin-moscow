import { Typography } from 'antd';
import cn from 'clsx';
import { ComponentPropsWithoutRef, ElementType, Fragment, memo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import s from './styles.module.scss';

interface CategoryProps<T extends ElementType> {
    as?: T;
    title: string;
    description?: string;
    id?: string;
    image?: string;
}

export const Category = memo(
    <T extends ElementType = 'li'>({
        as,
        title,
        description,
        id,
        image = '',
        webp,
        className,
        ...props
    }: CategoryProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof CategoryProps<T>>) => {
        const Tag = as ?? 'div';

        const Wrapper = ({ children }: { children: ReactNode }) =>
            id ? <Link to={`/places/?territories__category=${id}`}>{children}</Link> : <Fragment>{children}</Fragment>;

        return (
            <Tag
                className={cn(s.category, className)}
                style={{ '--png': `url(${image})`, '--webp': `url(${webp})` }}
                {...props}
            >
                <Wrapper>
                    <Typography.Title className={s.title} level={3}>
                        {title}
                    </Typography.Title>
                </Wrapper>
            </Tag>
        );
    }
);

Category.displayName = 'Category';
