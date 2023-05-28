import { isObject } from 'lodash-es';

import { ErrorLocationState } from '@/models';

import { isErrorStatus } from './isErrorStatus';

export const isErrorLocationState = (locationState: unknown): locationState is ErrorLocationState => {
    return isObject(locationState) && 'status' in locationState && isErrorStatus(locationState.status);
};
