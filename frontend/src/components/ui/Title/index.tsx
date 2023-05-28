import { Typography } from 'antd';
import { TitleProps as AntTitleProps } from 'antd/es/typography/Title';
import OriginTypography from 'antd/es/typography/Typography';
import cn from 'clsx';

import s from './styles.module.scss';

interface TitleProps extends OriginTypography, AntTitleProps {}

export const Title = ({ className, children, ...props }: TitleProps) => {
    return (
        <Typography.Title className={cn(s.title, className)} {...props}>
            {children}
        </Typography.Title>
    );
};
