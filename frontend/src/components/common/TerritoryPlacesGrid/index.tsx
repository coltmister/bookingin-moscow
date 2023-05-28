import { TerritoryPlaceCard } from '@/components';
import { TerritoryModel } from '@/models';

import s from './styles.module.scss';

interface TerritoryPlacesGridProps {
    territories: Array<TerritoryModel>;
}

export const TerritoryPlacesGrid = ({ territories }: TerritoryPlacesGridProps) => {
    return (
        <ul className={s.list}>
            {territories?.map((place) => (
                <li key={place.id}>
                    <TerritoryPlaceCard {...place} />
                </li>
            ))}
        </ul>
    );
};
