import { Row } from 'antd';
import React from 'react';

import { useGetTestimonialsQuery } from '../../../services/TestimonialService/Testimonial.service';
import { TestimonialCard } from '../../common/TestimonialCard';

export const UserTestimonials = () => {
    const { data } = useGetTestimonialsQuery({ my: true });
    return (
        <div>
            <Row wrap={false} style={{ gap: 8, margin: '16px 0' }}>
                <h2>Все отзывы</h2>
            </Row>
            <Row style={{ gap: 16 }}>
                {data &&
                    data.payload.map((item) => <TestimonialCard type={'tenant'} key={item.id} testimonial={item} />)}
            </Row>
        </div>
    );
};
