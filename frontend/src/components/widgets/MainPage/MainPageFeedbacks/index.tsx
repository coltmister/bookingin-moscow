import { Feedbacks } from '@/components';
import { useGetTestimonialsQuery } from '@/services';

import s from '../styles.module.scss';

export const MainPageFeedbacks = () => {
    const { data: testimonials } = useGetTestimonialsQuery();
    return (
        <section className={s.feed}>
            <Feedbacks testimonials={testimonials?.payload} />
        </section>
    );
};
