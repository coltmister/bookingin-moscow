import { Badge, Typography } from 'antd';

import { CATEGORIES_COLORS_MAP } from '@/constants';
import { CategoryModel } from '@/models';

import s from './styles.module.scss';

interface AboutProps {
    description: string;
    categories: Array<CategoryModel>;
}

export const About = ({ description, categories }: AboutProps) => {
    return (
        <div className={s.about}>
            <Typography.Title className={s.title} level={3}>
                О площадке
            </Typography.Title>
            <div className={s.categories}>
                {categories?.map((cat) => (
                    <Badge key={cat.id} color={CATEGORIES_COLORS_MAP[cat.name]} text={cat.name} />
                ))}
            </div>
            {description && <Typography.Paragraph className={s.descr}>{description}</Typography.Paragraph>}
        </div>
    );
};
