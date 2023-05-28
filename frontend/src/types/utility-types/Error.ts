export interface RMError {
    error: string;
    message: string;
    status: number;
    timestamp: string;
    path?: string;
}

export interface ReserveLinkError {
    exists: boolean;
    id: string;
    number: null;
    user: string;
}
