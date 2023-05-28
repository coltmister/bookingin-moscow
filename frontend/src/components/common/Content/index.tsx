import cn from 'clsx';
import React, { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

interface ContentProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    text?: string | ReactNode;
}
export const Content = ({ className, text, ...props }: ContentProps) => {
    return (
        <div className={cn(className)} {...props}>
            {text}
        </div>
    );
};
