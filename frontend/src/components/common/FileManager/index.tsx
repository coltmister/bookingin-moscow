import { UploadOutlined } from '@ant-design/icons';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, Upload, UploadFile, UploadProps } from 'antd';
import React, { useEffect, useState } from 'react';

import { generateFilelist } from '@/utils';

import { PlacePhotoModel } from '../../../services/PlacesService/Places.dto';

export interface FileManagerProps {
    url?: string | null | Array<PlacePhotoModel>;
    multiple?: boolean;
    uploadPhoto: (photo: {
        file: FormData;
    }) => Promise<{ data: null } | { error: FetchBaseQueryError | SerializedError }>;
    deletePhoto: (
        payload: string | void | { id: string; photoId: string }
    ) => Promise<{ data: null } | { error: FetchBaseQueryError | SerializedError }>;
}

export const FileManager = ({ url, uploadPhoto, deletePhoto, multiple = false }: FileManagerProps) => {
    const [filelist, setFilelist] = useState<UploadFile[]>([]);
    useEffect(() => {
        if (url) {
            const items = Array.isArray(url) ? url : [url];
            setFilelist(items.map(generateFilelist));
        } else {
            setFilelist([]);
        }
    }, [url]);

    const handleCustomRequest: UploadProps['customRequest'] = (e) => {
        const { onSuccess, onError } = e;

        const formData = new FormData();
        formData.append('file', e.file);

        uploadPhoto({ file: formData })
            .then((res) => {
                if ('data' in res) {
                    onSuccess && onSuccess('Ok');
                } else {
                    if (res?.error) {
                        // @ts-ignore
                        onError && onError(new Error(res.error.data.message));
                    }
                }
            })
            .catch(() => {
                onError && onError(new Error('Ошибка загрузки файла'));
            });
    };

    const handleOnChange: UploadProps['onChange'] = (e) => {
        if (e.file.status === 'removed') {
            deletePhoto(e.file.uid);
        }
        setFilelist(e.fileList);
    };
    return (
        <>
            <Upload
                fileList={filelist}
                onChange={handleOnChange}
                customRequest={handleCustomRequest}
                name='file'
                maxCount={multiple ? 100 : 1}
                listType={'picture'}
            >
                <Button icon={<UploadOutlined />}>Выберите файл</Button>
            </Upload>
        </>
    );
};
