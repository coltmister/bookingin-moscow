import { Button } from 'antd';

import { Container, Row, Title } from '@/ui';

import s from '../styles.module.scss';
import PNG from './img/image.png';
import WEBP from './img/image.webp';

export const MainPageSupport = () => {
    return (
        <section className={s.support}>
            <Container>
                <Row className={s.row}>
                    <div className={s.top}>
                        <div className={s.text}>
                            <Title level={2}>
                                Работаешь <br /> в креативной индустрии?
                            </Title>
                            <p>
                                Ты можешь получить финансовые и нефинансовые меры поддержки от правительства Москвы и
                                Агентства Креативных Индустрий.
                            </p>
                            <Button
                                className={s.link}
                                size='large'
                                type='primary'
                                href='https://createdin.moscow/support_measure'
                                target='_blank'
                            >
                                Узнать о мерах поддержки
                            </Button>
                        </div>
                        <picture>
                            <source srcSet={WEBP} type='image/webp' />
                            <img className={s.image} src={PNG} alt='Креативные площадки Москвы' />
                        </picture>
                    </div>
                </Row>
            </Container>
        </section>
    );
};
