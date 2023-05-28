import { isObject } from 'lodash-es';

import { RefreshTokenResponse } from '@/models';

export function isRefreshTokenResponse(data: unknown): data is RefreshTokenResponse {
    return isObject(data) && 'accessToken' in data && 'refreshToken' in data;
}
