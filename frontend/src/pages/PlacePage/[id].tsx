import { PlaceInfo } from '@/components';
import { useRouter } from '@/hooks';
import { RootLayout } from '@/layouts';
import { useGetPlaceByIdQuery } from '@/services';
import { Back, Container, Row, Spinner } from '@/ui';

import s from './styles.module.scss';

export const PlacePage = () => {
    const { query } = useRouter();
    const { data: place, isFetching } = useGetPlaceByIdQuery(query?.id.toString());

    return (
        <RootLayout>
            <section className={s.place}>
                <Container>
                    <Row className={s.back} justify='start'>
                        <Back />
                    </Row>
                </Container>
                {isFetching ? <Spinner className='ant-spin' /> : <PlaceInfo {...place} />}
            </section>
        </RootLayout>
    );
};
