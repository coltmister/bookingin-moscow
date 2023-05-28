import { UserModel } from './User.model';

export interface TenantModel extends Pick<UserModel, 'id' | 'name' | 'surname' | 'patronymic' | 'avatar_url'> {
    company_name: string | null;
    rating: number | null;
    snp: string;
}
