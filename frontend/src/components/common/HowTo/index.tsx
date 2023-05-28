import { Link } from 'react-router-dom';

import { useIsLarge } from '@/hooks';
import { Container, Row, Title } from '@/ui';

import { items } from './config';
import s from './styles.module.scss';

export const HowTo = () => {
    const isLarge = useIsLarge();

    return (
        <Container>
            <Row className={s.top}>
                <Title level={2} className={s.title}>
                    Как забронировать?
                </Title>
                <Link hidden={!isLarge} to='/places' className={s.popular}>
                    Перейти в каталог
                </Link>
            </Row>
            <Row>
                <ul className={s.list}>
                    {items.map((item) => (
                        <li key={item.id}>
                            {!isLarge && item.icon}
                            {isLarge && item.big}
                            {item.title}
                        </li>
                    ))}
                </ul>
            </Row>
            <Row>
                <Link hidden={isLarge} to='/places' className={s.popular}>
                    Перейти в каталог
                </Link>
            </Row>
        </Container>
    );
};
