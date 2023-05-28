import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { isObject } from 'lodash-es';

import { RMError } from '@/utility-types';

export function isRMError(error: unknown): error is RMError {
    return isObject(error) && 'message' in error;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return isObject(error) && 'status' in error;
}

export function isErrorWithMessage(error: unknown): error is { message: string } {
    return isObject(error) && 'message' in error && error.message === 'string';
}

export function isErrorWithData(error: unknown): error is { status: string | number; data: RMError } {
    return isObject(error) && 'data' in error;
}
