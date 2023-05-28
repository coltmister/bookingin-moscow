import { RadioChangeEvent } from 'antd';
import { useState } from 'react';

interface UseRadioProps<T> {
    defaultValue: T;
}

export const useRadio = <T>({ defaultValue }: UseRadioProps<T>) => {
    const [value, setValue] = useState<T>(defaultValue);
    const onChangeHandler = (e: RadioChangeEvent) => setValue(e.target.value);

    return {
        value,
        defaultValue,
        onChange: onChangeHandler,
    };
};
