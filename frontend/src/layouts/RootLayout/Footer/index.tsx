import cn from 'clsx';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

import { AkiLogo, Logo } from '@/assets/images';
import { Container, Row } from '@/ui';

import { footerLinks, social } from './config';
import s from './styles.module.scss';

type FooterProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export const Footer = ({ className, ...props }: FooterProps) => {
    return (
        <footer className={cn(s.footer, className)} {...props}>
            <Container className={s.container}>
                <Row className={s.headrow}>
                    <header className={s.header}>
                        <div className={s.logo}>
                            <Logo />
                        </div>
                        <p>
                            Платформа для поиска <br /> и бронирования креативных <br /> площадок Москвы.
                        </p>
                        <Link to='/places'>Каталог площадок</Link>
                    </header>
                </Row>
                <Row className={s.mainrow}>
                    <main className={s.main}>
                        <div className={s.top}>
                            <p>Проект при поддержке</p>
                            <AkiLogo />

                            <p className={s.description}>
                                Cоздано в 2020 году Департаментом предпринимательства и инновационного развития города
                                Москвы для поддержки и развития творческого бизнеса.
                            </p>
                        </div>
                        <ul className={s.links}>
                            {footerLinks.map((link) => (
                                <li key={link.id}>
                                    <a href={link.link} target='_blank' rel='noreferrer'>
                                        {link.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </main>
                </Row>
                <Row className={s.contacts}>
                    <footer className={s.innerFooter}>
                        <ul className={s.socials}>
                            {social.map((link) => (
                                <li key={link.id}>
                                    <a target='_blank' href={link.link} aria-label={link.title} rel='noreferrer'>
                                        {link.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <a href='tel:+74959883080'>+7 495 988-30-80</a>
                        <a href='mailto:info@mail.booking.moscow'>info@mail.booking.moscow</a>
                        <address>125009, Россия, Москва Вознесенский пер. 11, стр. 2</address>
                    </footer>
                </Row>
            </Container>
        </footer>
    );
};
