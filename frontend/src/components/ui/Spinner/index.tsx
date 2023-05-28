import cn from 'clsx';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

import s from './styles.module.scss';

type SpinnerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Spinner = ({ className, ...props }: SpinnerProps) => {
    return (
        <div className={cn(s.spinner, className)} {...props}>
            <div className={s.part}>
                <div className={s.rotator} />
            </div>
            <div className={cn(s.part, s.bottom)}>
                <div className={s.rotator} />
            </div>
        </div>
    );
};
