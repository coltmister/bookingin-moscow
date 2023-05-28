import { Empty as AntEmpty, EmptyProps as AntEmptyProps } from 'antd';

import s from './styles.module.scss';

type EmptyProps = AntEmptyProps;

export const Empty = ({ ...props }: EmptyProps) => {
    return <AntEmpty className={s.empty} description='Нет данных' {...props} />;
};
