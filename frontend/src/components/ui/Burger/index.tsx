import { Button, ButtonProps } from 'antd';
import cn from 'clsx';
import React from 'react';

import s from './styles.module.scss';

interface BurgerProps extends ButtonProps {
    active: boolean;
}

export const Burger = ({ active, className, ...props }: BurgerProps) => {
    return <Button className={cn(s.burger, active && s.active, className)} {...props} />;
};
