import { Radio, Typography } from 'antd';

import { PlacesGrid, PlacesMap } from '@/components';
import { useRadio } from '@/hooks';
import { Back, Container, Row, Title } from '@/ui';

import { CatalogueMode, catalogueSwitchMode } from './config';
import s from './styles.module.scss';

export const Catalogue = () => {
    const radio = useRadio<CatalogueMode>({ defaultValue: 'list' });

    const catalogueMap: Record<CatalogueMode, JSX.Element> = {
        list: <PlacesGrid />,
        map: <PlacesMap />,
    };

    return (
        <section className={s.catalog}>
            <Container>
                <Back />
                <Row className={s.heading} flex justify='sb' align='center'>
                    <Title level={2}>Каталог площадок</Title>
                    <Radio.Group
                        className={s.radio}
                        size='large'
                        optionType='button'
                        buttonStyle='solid'
                        options={catalogueSwitchMode}
                        value={radio.value}
                        onChange={radio.onChange}
                        defaultValue={radio.defaultValue}
                    />
                </Row>
                {catalogueMap[radio.value]}
            </Container>
        </section>
    );
};
