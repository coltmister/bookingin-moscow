import { Avatar, Button, Card, message, Modal, Row } from 'antd';
import Meta from 'antd/es/card/Meta';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { MdStarRate } from 'react-icons/all';
import { useToggle } from 'usehooks-ts';

import { Testimonial } from '../../../services/TestimonialService/Testimonial.dto';
import { useLandlordAnswerTestimonialMutation } from '../../../services/TestimonialService/Testimonial.service';

export interface TestimonialCard {
    testimonial: Testimonial;
    type: 'landlord' | 'tenant';
}

export const TestimonialCard = ({ testimonial, type = 'tenant' }: TestimonialCard) => {
    const [messageApi, contextHolder] = message.useMessage();

    const [isModalOpen, toggle] = useToggle();
    const [landLordTextAnswer, setLandlordAnswer] = useState<string>('');
    const [landlordAnswer] = useLandlordAnswerTestimonialMutation();

    const handleSubmit = () => {
        landlordAnswer({ id: testimonial.id, landlord_answer: landLordTextAnswer }).then((res) => {
            if ('error' in res) {
                messageApi.error('Ошибка сохранения ответа');
            } else {
                messageApi.success('Ответ сохранен');
            }
        });
    };

    const Header = () => (
        <Row style={{ justifyContent: 'space-between' }}>
            <div>{new Array(+testimonial.rating).fill(<MdStarRate color={'#E74362'} />)}</div>
            {dayjs(testimonial.created_at).locale('ru-RU').format('DD MMM YYYY')}
        </Row>
    );
    return (
        <>
            {contextHolder}
            {type === 'tenant' && (
                <Card title={<Header />} style={{ minWidth: 300, maxWidth: 500, height: 'fit-content' }}>
                    <Meta
                        avatar={<Avatar src={testimonial.site.image_url} />}
                        title={testimonial.site.name}
                        description={testimonial.text}
                    />
                    {testimonial.landlord_answer && (
                        <Meta
                            style={{ width: '100%', marginTop: 16 }}
                            title={'Ответ арендодателя: '}
                            description={testimonial.text}
                        />
                    )}
                </Card>
            )}
            {type === 'landlord' && (
                <>
                    <Card title={<Header />} style={{ width: 300, height: '100%' }}>
                        <Meta
                            avatar={<Avatar src={testimonial.tenant.avatar_thumbnail_url} />}
                            title={testimonial.tenant.name + ' ' + testimonial.tenant.surname}
                            description={testimonial.text}
                        />
                        {testimonial.landlord_answer ? (
                            <Meta
                                style={{ width: '100%', marginTop: 16 }}
                                title={'Арендодатель: '}
                                avatar={<Avatar src={testimonial.site.image_url} />}
                                description={testimonial.landlord_answer}
                            />
                        ) : (
                            <Button style={{ width: '100%', marginTop: 16 }} onClick={toggle} size={'small'}>
                                Добавить ответ
                            </Button>
                        )}
                    </Card>
                    <Modal title={'Ответ на отзыв'} onCancel={toggle} open={isModalOpen} onOk={handleSubmit}>
                        <TextArea
                            placeholder={'Ответ арендатору'}
                            rows={3}
                            value={landLordTextAnswer}
                            onChange={(e) => setLandlordAnswer(e.target.value)}
                        />
                    </Modal>
                </>
            )}
        </>
    );
};
