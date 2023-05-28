import { StarFilled } from '@ant-design/icons';
import { Typography } from 'antd';

import { useIsLarge } from '@/hooks';
import { getDeclinations } from '@/utils';

import { Rating } from '../../Rating';
import s from './styles.module.scss';

interface TopProps {
    title: string;
    rating?: number | undefined;
    feedbackCount?: number | undefined;
}

export const Top = ({ title, rating, feedbackCount }: TopProps) => {
    const isLarge = useIsLarge();
    return (
        <div className={s.top}>
            <Typography.Title className={s.title} level={2}>
                {title}
            </Typography.Title>
            {Boolean(rating) && <Rating rating={rating} onlyCount={!isLarge} />}
            {Boolean(feedbackCount) && (
                <span className={s.feedback}>
                    {getDeclinations({ count: feedbackCount, few: 'отзывов', many: 'отзывов', one: 'отзыв' })}
                </span>
            )}
        </div>
    );
};
