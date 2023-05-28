import { Map } from '@/components';
import { useRouter } from '@/hooks';
import { useGetPlacesQuery } from '@/services';
import { Row } from '@/ui';

export const PlacesMap = () => {
    const { query } = useRouter();
    const { data } = useGetPlacesQuery(query);

    return (
        <Row flex>
            <Map places={data?.payload} />
        </Row>
    );
};
