import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';

export const filterOption = (input: string, option: BaseOptionType | DefaultOptionType | undefined) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
