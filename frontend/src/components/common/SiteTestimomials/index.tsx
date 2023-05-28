import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Modal, Row, Tooltip } from 'antd';
import React, { useState } from 'react';
import { MdStarRate } from 'react-icons/all';
import { useParams } from 'react-router-dom';
import { useToggle } from 'usehooks-ts';

import { TerritoryModel } from '@/models';
import { useDeletePlaceMutation, useGetPlaceByIdQuery } from '@/services';
import { useGetTestimonialsQuery } from '@/services';

import { Rating } from '../Rating';
import { TerritoryForm } from '../TerritoryForm';
import { TerritoryList } from '../TerritoryList';
import { TestimonialCard } from '../TestimonialCard';

export const SiteTestimonials = () => {
    const params = useParams();
    const { data, isLoading } = useGetTestimonialsQuery({ site: params?.id }, { skip: !params?.id });
    // const [isOpen, toggle] = useToggle();
    // const [editableItem, setEditableItem] = useState<TerritoryModel | null>(null);
    //
    // const handleOnEdit = (editableItem: TerritoryModel) => {
    //   toggle();
    //   setEditableItem(editableItem);
    // };

    const meanStars = data?.payload.reduce((acc, cur) => acc + cur.rating, 0) / data?.payload?.length ?? 0;
    console.log(data?.payload);
    return (
        <div>
            {data && (
                <>
                    <Row wrap={false} style={{ gap: 8, margin: '16px 0' }}>
                        <h2>Рейтинг площадки:</h2>
                        <Row wrap={false}>{!isNaN(meanStars) && <Rating rating={meanStars} />}</Row>
                    </Row>
                    <Divider />
                    <Row wrap={false} style={{ gap: 8, margin: '16px 0' }}>
                        <h2>Отзывы</h2>
                    </Row>
                    <Row style={{ gap: 16 }}>
                        {data &&
                            data.payload.map((item) => (
                                <TestimonialCard type={'landlord'} key={item.id} testimonial={item} />
                            ))}
                    </Row>
                    {/* <Modal footer={false} open={isOpen} onCancel={toggle}>
              <TerritoryForm defaultItem={editableItem} onClose={toggle} />
           </Modal> */}
                </>
            )}
        </div>
    );
};
