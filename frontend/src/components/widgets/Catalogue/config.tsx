import { BsFillGridFill, TbMapPinFilled } from 'react-icons/all';

import s from './styles.module.scss';

export type CatalogueMode = 'list' | 'map';

export const catalogueSwitchMode = [
    {
        label: (
            <div className={s.radioItem}>
                <BsFillGridFill />
                <span>Списком</span>
            </div>
        ),
        value: 'list',
    },
    {
        label: (
            <div className={s.radioItem}>
                <TbMapPinFilled />
                <span>На карте</span>
            </div>
        ),
        value: 'map',
    },
];
