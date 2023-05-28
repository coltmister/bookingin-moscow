import cn from 'clsx';
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

import { Container, Row } from '@/ui';

import { Content } from '../Content';
import s from './styles.module.scss';

interface HeroProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    text: ReactNode;
    image: string;
}

export const Hero = ({ text, image, children, className, ...props }: HeroProps) => {
    return (
        <section className={cn(s.hero, className)} {...props} style={{ backgroundImage: `url(${image})` }}>
            <Container className={s.container}>
                <Row flex justify='center'>
                    <Content text={text} />
                </Row>
            </Container>
            {children}
        </section>
    );
};
