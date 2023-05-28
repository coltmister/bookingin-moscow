export interface AuthRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    isAdmin: boolean;
}

export type RefreshTokenResponse = Omit<AuthResponse, 'isAdmin'>;
