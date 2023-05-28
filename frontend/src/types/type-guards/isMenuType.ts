import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { isObject } from 'lodash-es';

export const isMenuType = (value: unknown): value is MenuItemType => {
    return isObject(value) && 'label' in value;
};
