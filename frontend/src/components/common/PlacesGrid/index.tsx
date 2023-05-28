import { useRouter } from '@/hooks';
import { PlaceModel } from '@/models';
import { useGetPlacesQuery, useGetPlacesRecommendedByAiQuery } from '@/services';
import { Empty, Spinner } from '@/ui';

import { PlaceCard } from '../PlaceCard';
import s from './styles.module.scss';

interface PlacesGridProps {
    count?: number;
}

export const PlacesGrid = ({ count }: PlacesGridProps) => {
    const { query } = useRouter();
    console.log({ skip: 'ai' in query });
    const { data: dataMain, isFetching: isFetchingMain } = useGetPlacesQuery(query, { skip: 'ai' in query });
    const { data: dataAi, isFetching: isFetchingAi } = useGetPlacesRecommendedByAiQuery(query, {
        skip: !('ai' in query),
    });

    const data = 'ai' in query ? dataAi : dataMain;
    const isFetching = 'ai' in query ? isFetchingAi : isFetchingMain;

    const renderItem = count ? data?.payload?.splice(0, count) : data?.payload;

    return (
        <>
            <ul className={s.list}>
                {renderItem?.map((place) => (
                    <PlaceCard as='li' key={place.id} {...place} title={place.name} />
                ))}
            </ul>
            {isFetching && <Spinner className='ant-spin' />}
            {!renderItem?.length && !isFetching && <Empty />}
        </>
    );
};
