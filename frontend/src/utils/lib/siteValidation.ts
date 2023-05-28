import { object, string } from 'yup';

export const siteValidation = object({
    name: string().trim().required(),
    brief_description: string().trim().required(),
    url: string().url(),
    email: string().email().required(),
    address: string().trim().required(),
    underground: string().trim().required(),
});
