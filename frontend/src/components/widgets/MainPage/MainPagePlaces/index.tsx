import { Typography } from 'antd';

import { CategoriesGrid } from '@/components';
import { Container, Row } from '@/ui';

import s from '../styles.module.scss';
export const MainPagePlaces = () => {
    return (
        <section className={s.places}>
            <Container>
                <Typography.Title className={s.title} level={2}>
                    Категории площадок
                </Typography.Title>
                <CategoriesGrid />
            </Container>
        </section>
    );
};
