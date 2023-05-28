import { Testimonial } from '@/models';

import { Rating } from '../Rating';
import s from './styles.module.scss';

type TestimonialItemProps = Testimonial;

export const TestimonialItem = ({ tenant, site, rating, text }: TestimonialItemProps) => {
    return (
        <article className={s.card}>
            <header className={s.top}>
                {tenant.avatar_thumbnail_url && <img src={tenant.avatar_thumbnail_url} alt='Аватар отзыва' />}
                {!tenant.avatar_thumbnail_url && <div className={s.imgStub} />}
                <p className={s.name}>{tenant.name}</p>
            </header>
            <main className={s.main}>
                <h3>{site.name}</h3>
                <Rating onlyCount rating={rating} />
            </main>
            <p className={s.feedback}>{text}</p>
        </article>
    );
};
