export interface FilterSearchParams<T> {
    page?: number;
    itemsPerPage?: number;
    sortBy?: keyof T;
    sortDesc?: boolean;
    search?: string;
}
