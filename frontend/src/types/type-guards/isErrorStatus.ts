import { isNumber } from 'lodash-es';

import { ERROR_STATUS } from '@/constants';
import { ErrorStatus } from '@/models';

export const isErrorStatus = (errorStatus: unknown): errorStatus is ErrorStatus => {
    return isNumber(errorStatus) && errorStatus in ERROR_STATUS;
};
