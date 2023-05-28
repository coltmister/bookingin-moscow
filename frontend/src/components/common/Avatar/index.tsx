import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Modal, Upload, UploadFile, UploadProps } from 'antd';
import { RcFile } from 'antd/es/upload';
import ImgCrop from 'antd-img-crop';
import React, { ReactNode, useEffect, useState } from 'react';
import { useToggle } from 'usehooks-ts';

import { generateFilelist, getBase64 } from '@/utils';

import { PlacePhotoModel } from '../../../services/PlacesService/Places.dto';
import s from './style.module.scss';

export interface AvatarProps {
    url?: string | null | Array<PlacePhotoModel>;
    multiple?: boolean;
    uploadPhoto: (photo: {
        file: FormData;
    }) => Promise<{ data: null } | { error: FetchBaseQueryError | SerializedError }>;
    deletePhoto: (
        payload: string | void | { id: string; photoId: string }
    ) => Promise<{ data: null } | { error: FetchBaseQueryError | SerializedError }>;
    uploadText?: ReactNode;
    className?: string;
}

export const Avatar = ({
    uploadText = `Загрузить\nфото`,
    url,
    uploadPhoto,
    deletePhoto,
    multiple = false,
    className,
}: AvatarProps) => {
    const [isOpen, toggle] = useToggle();
    const [previewImage, setPreviewImage] = useState<string>();
    const [filelist, setFilelist] = useState<UploadFile[]>([]);
    useEffect(() => {
        if (url) {
            const items = Array.isArray(url) ? url : [url];
            setFilelist(items.map(generateFilelist));
        } else {
            setFilelist([]);
        }
    }, [url]);

    const onPreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        toggle();
    };

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
        } else {
            setFilelist(e.fileList);
        }
    };
    return (
        <div className={className}>
            <ImgCrop
                showGrid
                rotationSlider
                showReset
                resetText='Сброс'
                modalTitle='Предпросмотр'
                modalClassName={s.crop}
            >
                <Upload
                    fileList={filelist}
                    accept='.png, .jpg, .jpeg'
                    onChange={handleOnChange}
                    className={s.upload}
                    customRequest={handleCustomRequest}
                    name='file'
                    maxCount={multiple ? 100 : 1}
                    onPreview={onPreview}
                    listType={multiple ? 'picture-card' : 'picture-circle'}
                >
                    {multiple ? uploadText : !filelist?.length && uploadText}
                </Upload>
            </ImgCrop>
            <Modal open={isOpen} title='Просмотр' footer={null} onCancel={toggle}>
                <img alt='Аватар' style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};
