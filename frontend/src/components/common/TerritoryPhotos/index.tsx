import { Row } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Avatar } from '@/components';

import {
    useDeleteTerritoryPhotosMutation,
    useGetTerritoryPhotosQuery,
    useUploadTerritoryPhotosMutation,
} from '../../../services/TerritoryService/Territory.service';
import s from './style.module.scss';
export const TerritoryPhotos = () => {
    const params = useParams();
    const { data } = useGetTerritoryPhotosQuery(params?.territoryId, { skip: !params?.territoryId });
    const [uploadPhoto] = useUploadTerritoryPhotosMutation();
    const [deletePhoto] = useDeleteTerritoryPhotosMutation();
    const uploadPhotoWrapper = (id: string) => (file: { file: FormData }) => uploadPhoto({ file: file.file, id });
    return (
        <div>
            <Row style={{ margin: '16px 0', gap: 8 }} wrap={false}>
                <h2>Фотографии</h2>
            </Row>
            <Avatar
                multiple
                className={s.avatar}
                url={data?.payload}
                uploadPhoto={uploadPhotoWrapper(params.territoryId)}
                deletePhoto={deletePhoto}
            />
        </div>
    );
};
