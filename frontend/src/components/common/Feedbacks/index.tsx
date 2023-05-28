import { Button, message, Modal, Rate, Space, theme, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Swiper, SwiperSlide } from 'swiper/react';

import { TestimonialItem } from '@/components';
import { useIsLarge, useIsMedium, useRouter } from '@/hooks';
import { Testimonial } from '@/models';
import { useCreateTestimonialMutation } from '@/services';
import { Container, Row, Title } from '@/ui';

import s from './styles.module.scss';

interface FeedbacksProps {
    testimonials: Testimonial[];
}

export const Feedbacks = ({ testimonials }: FeedbacksProps) => {
    const { query } = useRouter();
    const form = useForm();
    const isLarge = useIsLarge();
    const isMedium = useIsMedium();
    const [isOpen, setIsOpen] = useState(false);
    const [createFeed, { isError, error }] = useCreateTestimonialMutation();
    const { token } = theme.useToken();
    const [api, holder] = message.useMessage();

    const slidesPerViewCalculate = () => {
        if (isLarge) return 3;
        if (isMedium) return 2;
        return 1;
    };

    const slidesPerView = slidesPerViewCalculate();

    const onModalHandler = () => setIsOpen(!isOpen);

    const onSubmit = form.handleSubmit(async (data) => {
        createFeed({ id: query?.id, ...data });
        onModalHandler();
    });

    useEffect(() => {
        isError &&
            api.open({
                type: 'error',
                content: error?.data?.message ?? 'Произошла ошибка',
            });
    }, [isError]);

    return (
        <>
            <Container>
                <Row className={s.title} flex align='center' justify='sb'>
                    <Title level={2}>Отзывы пользователей</Title>
                    <Button size='large' type='primary' onClick={onModalHandler}>
                        Оставить отзыв
                    </Button>
                </Row>
                <Row>
                    <Swiper spaceBetween={20} slidesPerView={slidesPerView} className={s.slider} wrapperTag='ul'>
                        {testimonials?.map((feed) => (
                            <SwiperSlide key={feed.id} tag='li'>
                                <TestimonialItem {...feed} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Row>
            </Container>
            <Modal title='Оставить отзыв' open={isOpen} onCancel={onModalHandler} onOk={onSubmit}>
                <FormProvider {...form}>
                    <form onSubmit={onSubmit}>
                        <Space direction='vertical'>
                            <Controller
                                render={({ field }) => (
                                    <>
                                        <Typography.Text>Оценка:&nbsp;</Typography.Text>
                                        <Rate style={{ color: token.colorPrimary }} {...field} />
                                    </>
                                )}
                                name='rating'
                            />
                            <Controller
                                name='text'
                                render={({ field }) => (
                                    <TextArea
                                        placeholder='Введите текст отзыва'
                                        style={{ height: 200, width: 300 }}
                                        {...field}
                                    />
                                )}
                            />
                        </Space>
                    </form>
                </FormProvider>
            </Modal>
            {holder}
        </>
    );
};
