export interface ServiceModel {
    id: string;
    name: string;
    description: string;
    type: ServiceModelType;
    max_count: null | number;
}

export interface ServiceModelType {
    id: string;
    name: string;
}
