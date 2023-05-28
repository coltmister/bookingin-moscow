import { Row } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import {
    useDeletePlaceDocsMutation,
    useDeletePlacePhotosMutation,
    useGetPlaceDocsQuery,
    useUploadPlaceDocsMutation,
    useUploadPlacePhotosMutation,
} from '@/services';

import { FileManager } from '../FileManager';

export const SiteDocuments = () => {
    const params = useParams();
    const { data } = useGetPlaceDocsQuery(params?.id, { skip: !params?.id });
    const [uploadPhoto] = useUploadPlaceDocsMutation();
    const [deletePhoto] = useDeletePlaceDocsMutation();
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
                uploadPhoto={uploadDocWrapper(params.id)}
                deletePhoto={deleteDocWrapper(params.id)}
            />
        </div>
    );
};
