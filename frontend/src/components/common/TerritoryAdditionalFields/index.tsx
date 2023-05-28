import { Button } from 'antd';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { useGetTerritoryAdditionalFieldsByIdQuery } from '../../../services/TerritoryService/Territory.service';
import { AdditionalField } from '../AdditionalField';

export const TerritoryAdditionalFields = () => {
    const params = useParams();
    const [isCreatingNewField, toggleNewField] = useToggle();

    const { data, isLoading } = useGetTerritoryAdditionalFieldsByIdQuery(params?.territoryId, {
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
            <h2 style={{ margin: '16px 0' }}>Дополнительные поля</h2>
            {!isLoading && (
                <>
                    {!!data &&
                        data.map((item) => (
                            <AdditionalField key={item.id} defaultValue={item} isDefaultEditable={false} />
                        ))}
                    {isCreatingNewField && (
                        <AdditionalField onCancelCreate={handleCancelAddField} isDefaultEditable={true} />
                    )}
                    <Button onClick={handleAddField}>Добавить поле</Button>
                </>
            )}
        </section>
    );
};
