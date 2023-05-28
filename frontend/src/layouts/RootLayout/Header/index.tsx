import cn from 'clsx';
import React, { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { Logo } from '@/assets/images';
import { Navigation } from '@/components';
import { useDocumentToScrollThrottled, useIsScroll } from '@/hooks';
import { Burger, Drawer } from '@/ui';

import s from './styles.module.scss';

type HeaderProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export const Header = ({ className, ...props }: HeaderProps) => {
    const [isHidden, setHidden] = useState<boolean>(false);
    const hasScroll = useIsScroll();

    const [isActive, setActive] = useToggle(false);
    const [isScrolled, setScrolled] = useState<boolean>(false);

    const MIN_SCROLL = 100;
    const TIMEOUT_DELAY = 100;

    useDocumentToScrollThrottled((callbackData) => {
        const { previousScrollTop, currentScrollTop } = callbackData;
        const isScrolledDown = previousScrollTop < currentScrollTop;
        const isMinimumScrolled = currentScrollTop > MIN_SCROLL;

        setScrolled(currentScrollTop > 2);

        setTimeout(() => {
            setHidden(isScrolledDown && isMinimumScrolled);
        }, TIMEOUT_DELAY);
    });

    return (
        <header
            className={cn(
                s.header,
                { [s.hidden]: isHidden && hasScroll, [s.scrolled]: isScrolled || !hasScroll },
                className
            )}
            {...props}
        >
            <div className={s.container}>
                <Link className={s.logo} to='/'>
                    <Logo />
                </Link>
                <Burger className={s.btn} active={isActive} onClick={setActive} />
                <Navigation className={s.nav} />
                <Drawer className={s.drawer} open={isActive} onClose={setActive}>
                    <Navigation className={s.nav} />
                </Drawer>
            </div>
        </header>
    );
};
