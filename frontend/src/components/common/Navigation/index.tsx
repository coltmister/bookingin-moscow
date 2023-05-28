import { Button } from 'antd';
import cn from 'clsx';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import { AiOutlinePlus } from 'react-icons/all';
import { Link } from 'react-router-dom';

import { useAuth, useRouter } from '@/hooks';
import { useGetCurrentUserQuery } from '@/services';

import { ProfileButton } from '../ProfileButton';
import { links } from './config';
import s from './styles.module.scss';

type NavigationProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
export const Navigation = ({ className, ...props }: NavigationProps) => {
    const { history, pathname, location } = useRouter();
    const isActive = (path: string) => pathname === path;
    const { isAuth } = useAuth();
    const { data, isLoading } = useGetCurrentUserQuery(null, { skip: !isAuth });

    const onClickHandler = () => {
        if (pathname === '/profile' && (location.hash === '#bookings' || location.hash === '#sites')) return;
        if (data?.role.name === 'Арендатор') {
            history('/profile#bookings');
        } else {
            history('/profile#sites');
        }
    };

    return (
        <nav className={cn(s.menu, className)} {...props}>
            <div className={s.left}>
                {links.map((link) => (
                    <Link
                        key={link.id}
                        to={link.to}
                        className={cn(s.link, {
                            [s.active]: isActive(link.to),
                        })}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            <div className={s.right}>
                <Button hidden={isLoading} onClick={onClickHandler} className={s.addPlace} type='text'>
                    {data?.role.name === 'Арендатор' ? (
                        <>мои бронирования</>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AiOutlinePlus />
                            добавить площадку
                        </div>
                    )}
                </Button>
                <ProfileButton hidden={isLoading} />
            </div>
        </nav>
    );
};
