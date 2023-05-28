import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

export const disabledPastDates: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
};
