import cn from 'clsx';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';

import s from './styles.module.scss';

type ContainerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Container = ({ className, children, ...props }: ContainerProps) => {
    return (
        <div className={cn(s.container, className)} {...props}>
            {children}
        </div>
    );
};
