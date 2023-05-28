import clsx from 'clsx';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { Range } from '@/utility-types';

import s from './styles.module.scss';

interface RowProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    lg?: Range<1, 12>;
    md?: Range<1, 8>;
    xs?: Range<1, 4>;
    flex?: boolean;
    justify?: 'sb' | 'center' | 'start' | 'end';
    align?: 'center' | 'start' | 'end';
}

export const Row = ({ className, flex, justify, align, children, xs = 4, md = 8, lg = 12, ...props }: RowProps) => {
    return (
        <div
            className={clsx(s.item, className, {
                [s[`xs-${xs}`]]: xs,
                [s[`md-${md}`]]: md,
                [s[`item-${lg}`]]: lg,
                [s.flex]: flex,
                [s.jcsb]: justify === 'sb',
                [s.jcc]: justify === 'center',
                [s.jcfs]: justify === 'start',
                [s.jcfe]: justify === 'end',
                [s.aic]: align === 'center',
                [s.aifs]: align === 'start',
                [s.aife]: align === 'end',
            })}
            {...props}
        >
            {children}
        </div>
    );
};
