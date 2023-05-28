import { Row } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import { Avatar } from '@/components';
import { useDeletePlacePhotosMutation, useGetPlacePhotosQuery, useUploadPlacePhotosMutation } from '@/services';

import s from './style.module.scss';
export const SitePhotos = () => {
    const params = useParams();
    const { data } = useGetPlacePhotosQuery(params?.id, { skip: !params?.id });
    const [uploadPhoto] = useUploadPlacePhotosMutation();
    const [deletePhoto] = useDeletePlacePhotosMutation();
    const uploadPhotoWrapper = (id: string) => (file: { file: FormData }) => uploadPhoto({ file: file.file, id });
    const deletePhotoWrapper = (id: string) => (photoId: string) => deletePhoto({ photoId, id });

    return (
        <div>
            <Row style={{ margin: '16px 0', gap: 8 }} wrap={false}>
                <h2>Фотографии</h2>
            </Row>
            <Avatar
                className={s.avatar}
                multiple
                url={data?.payload}
                uploadPhoto={uploadPhotoWrapper(params.id)}
                deletePhoto={deletePhotoWrapper(params.id)}
            />
        </div>
    );
};
