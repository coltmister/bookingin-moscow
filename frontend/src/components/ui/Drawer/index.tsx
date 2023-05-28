import { Drawer as AntDrawer, DrawerProps as AntDrawerProps } from 'antd';
import cn from 'clsx';
import { TfiClose } from 'react-icons/all';

import s from './styles.module.scss';
type DrawerProps = AntDrawerProps;
export const Drawer = ({ className, ...props }: DrawerProps) => {
    return <AntDrawer className={cn(s.drawer, className)} closeIcon={<TfiClose />} {...props} />;
};
