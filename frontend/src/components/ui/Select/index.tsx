import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';
import { BaseSelectRef } from 'rc-select/lib/BaseSelect';
import { ForwardedRef, forwardRef } from 'react';
import { IoMdClose } from 'react-icons/all';
import { HiOutlineChevronDown } from 'react-icons/hi';

import s from './styles.module.scss';

type SelectProps = AntSelectProps;
export const Select = forwardRef(({ ...props }: SelectProps, ref: ForwardedRef<BaseSelectRef>) => {
    return (
        <AntSelect
            ref={ref}
            className={s.select}
            suffixIcon={<HiOutlineChevronDown />}
            maxTagCount='responsive'
            removeIcon={<IoMdClose />}
            {...props}
        />
    );
});

Select.displayName = 'Select';
