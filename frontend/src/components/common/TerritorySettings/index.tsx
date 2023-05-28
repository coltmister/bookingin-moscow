import { Divider } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetTerritoryByIdQuery } from '../../../services/TerritoryService/Territory.service';
import { TerritoryAdditionalFields } from '../TerritoryAdditionalFields';
import { TerritoryAdditionalServiceFields } from '../TerritoryAdditionalServiceFields';
export const TerritorySettings = () => {
    const params = useParams();

    const { data } = useGetTerritoryByIdQuery(params?.territoryId ?? '', {
        skip: !params?.territoryId,
    });

    return (
        <div>
            {data && (
                <>
                    <TerritoryAdditionalFields />
                    <Divider />
                    <TerritoryAdditionalServiceFields />
                </>
            )}
        </div>
    );
};
