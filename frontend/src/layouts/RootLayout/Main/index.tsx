import cn from 'clsx';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

import s from './styles.module.scss';

type MainProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export const Main = ({ className, children, ...props }: MainProps) => {
    return (
        <main className={cn(s.main, className)} {...props}>
            {children}
        </main>
    );
};
