import { Row } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import {
    useDeleteTerritoryDocsMutation,
    useGetTerritoryDocsQuery,
    useUploadTerritoryDocsMutation,
} from '../../../services/TerritoryService/Territory.service';
import { FileManager } from '../FileManager';
export const TerritoryDocuments = () => {
    const params = useParams();
    const { data } = useGetTerritoryDocsQuery(params?.territoryId, { skip: !params?.territoryId });
    const [uploadPhoto] = useUploadTerritoryDocsMutation();
    const [deletePhoto] = useDeleteTerritoryDocsMutation();
    const uploadDocWrapper = (id: string) => (file: { file: FormData }) => uploadPhoto({ file: file.file, id });
    const deleteDocWrapper = (id: string) => (photoId: string) => deletePhoto({ photoId, id });

    return (
        <div>
            <Row style={{ margin: '16px 0', gap: 8 }} wrap={false}>
                <h2>Документы</h2>
            </Row>
            <FileManager
                multiple
                url={data?.payload}
                uploadPhoto={uploadDocWrapper(params.territoryId)}
                deletePhoto={deleteDocWrapper(params.territoryId)}
            />
        </div>
    );
};
