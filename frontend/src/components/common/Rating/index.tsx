import { StarFilled } from '@ant-design/icons';

import s from './styles.module.scss';

interface RatingProps {
    rating?: number | undefined;
    onlyCount?: boolean;
}

export const Rating = ({ rating, onlyCount }: RatingProps) => {
    if (isNaN(rating)) return;

    if (onlyCount && rating) {
        return (
            <div className={s.rating}>
                {rating}
                <StarFilled />
            </div>
        );
    }

    return (
        <ul className={s.rating}>
            {Array(Math.floor(rating))
                .fill('')
                .map((_, idx) => (
                    <li key={idx}>
                        <StarFilled />
                    </li>
                ))}
        </ul>
    );
};
