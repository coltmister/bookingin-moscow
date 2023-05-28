import { Button } from 'antd';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { useGetTerritoryAdditionalServicesByIdQuery } from '../../../services/TerritoryService/Territory.service';
import { AdditionalServiceField } from '../AdditionalServiceField';

export const TerritoryAdditionalServiceFields = () => {
    const params = useParams();
    const [isCreatingNewField, toggleNewField] = useToggle();

    const { data, isLoading } = useGetTerritoryAdditionalServicesByIdQuery(params?.territoryId, {
        skip: !params?.territoryId,
    });

    const handleAddField = () => {
        toggleNewField();
    };

    const handleCancelAddField = () => {
        toggleNewField();
    };
    return (
        <section>
            <h2 style={{ margin: '16px 0' }}>Услуги</h2>
            {!isLoading && (
                <>
                    {!!data &&
                        data.map((item) => (
                            <AdditionalServiceField key={item.id} defaultValue={item} isDefaultEditable={false} />
                        ))}
                    {isCreatingNewField && (
                        <AdditionalServiceField onCancelCreate={handleCancelAddField} isDefaultEditable={true} />
                    )}
                    <Button onClick={handleAddField}>Добавить услугу</Button>
                </>
            )}
        </section>
    );
};
