import { useRouter } from '@/hooks';
import { PlaceModel } from '@/models';
import { useGetTerritoriesByCompanyIdQuery, useGetTestimonialsQuery } from '@/services';
import { Container, Row, Title } from '@/ui';

import { Feedbacks } from '../Feedbacks';
import { Map } from '../Map';
import { TerritoryPlacesGrid } from '../TerritoryPlacesGrid';
import { About } from './About';
import { AdditionalInfo } from './AdditionalInfo';
import { Address } from './Address';
import s from './styles.module.scss';
import { Top } from './Top';

type PlaceInfoProps = PlaceModel;

export const PlaceInfo = (props: PlaceInfoProps) => {
    const {
        name,
        rating,
        email,
        url,
        brief_description,
        categories,
        feedback_count,
        underground,
        address,
        start_time,
        end_time,
        image_url,
    } = props;
    const { query } = useRouter();
    const { data: territories } = useGetTerritoriesByCompanyIdQuery(query?.id);
    const { data: testimonials } = useGetTestimonialsQuery({ site: query?.id });

    return (
        <>
            <Container className={s.main}>
                <Row>{image_url && <img className={s.image} src={image_url} alt={name} />}</Row>
                <Row lg={7} xs={4}>
                    <Top title={name} feedbackCount={feedback_count} rating={rating} />
                    {address && <Address address={address} underground={underground} />}
                    {end_time && start_time && (
                        <AdditionalInfo
                            link={url}
                            startTime={start_time}
                            endTime={end_time}
                            email={email}
                            phone={null}
                        />
                    )}
                    <About description={brief_description} categories={categories} />
                </Row>
                <Row className={s.map} lg={5} xs={4}>
                    <Map
                        className={s.map}
                        places={[props]}
                        center={[props.coords?.longitude, props.coords?.latitude]}
                    />
                </Row>
                <Row xs={4}>
                    <Title className={s.title} level={2}>
                        Можно забронировать на площадке:
                    </Title>
                    <TerritoryPlacesGrid territories={territories?.payload} />
                </Row>
            </Container>
            <Feedbacks testimonials={testimonials?.payload} />
        </>
    );
};
