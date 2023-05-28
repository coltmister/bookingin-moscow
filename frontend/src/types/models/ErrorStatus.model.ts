import { ERROR_STATUS } from '@/constants';

export type ErrorStatus = keyof typeof ERROR_STATUS;

export interface ErrorLocationState {
    status: ErrorStatus;
}
