import { CompanyModel } from './Company.model';

export interface UserModel {
    id: string;
    role: UserRole;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    position: string;
    avatar_url: string;
    avatar_thumbnail_url: string;
    date_of_birth: string;
    is_active: boolean;
    is_verified: boolean;
    is_admin: boolean;
    company: CompanyModel;
}

export interface UserTenantModel extends UserModel {
    date_of_birth: string;
}

export type UserLandlordModel = UserModel;

export interface UserRole {
    id: number;
    name: Role;
}

export enum Role {
    'Арендатор' = 1,
    'Арендодатель' = 2,
}
