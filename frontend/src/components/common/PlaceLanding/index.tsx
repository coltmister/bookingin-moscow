import { FormProvider, useForm } from 'react-hook-form';

import { LandingForm } from '@/models';

import { LandingOrder } from './LandingOrder';

export const PlaceLanding = () => {
    const formData = useForm<LandingForm>({});

    return (
        <div>
            <FormProvider {...formData}>
                <LandingOrder />
            </FormProvider>
        </div>
    );
};
