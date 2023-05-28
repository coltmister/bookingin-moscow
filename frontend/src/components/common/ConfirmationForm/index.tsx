import { PhoneOutlined } from '@ant-design/icons';
import { Alert, Button, Col, Input, Row, Segmented, Typography } from 'antd';
import { useState } from 'react';
import { MdEmail, MdOutlineSms } from 'react-icons/all';

import {
    useConfirmBookingWithCodeMutation,
    useInitCallingForSigningMutation,
    useInitEmailForSigningMutation,
} from '@/services';

export interface ConfirmationFormProps {
    bookingId: string;
    onSuccess: () => void;
    offerUrl: string;
}

export const ConfirmationForm = ({ bookingId, onSuccess, offerUrl }: ConfirmationFormProps) => {
    const [confirmationId, setConfirmationId] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [typeValue, setTypeValue] = useState('phone');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [confirmBooking, { isLoading: isConfirmationLoading }] = useConfirmBookingWithCodeMutation();
    const [initCall, { isLoading: isCallLoading }] = useInitCallingForSigningMutation();
    const [initEmail, { isLoading: isEmailLoading }] = useInitEmailForSigningMutation();
    const handleClick = () => {
        const action = typeValue === 'phone' ? initCall : initEmail;
        action({ booking_id: bookingId }).then((res) => {
            if (!('error' in res)) {
                setIsCodeSent(true);
                // @ts-ignore
                setConfirmationId(res.data.id);
            } else {
                // Ошибка
            }
        });
    };

    const handleConfirmation = () => {
        confirmBooking({ confirmation_id: confirmationId, code }).then((res) => {
            if (!('error' in res)) {
                onSuccess();
            }
        });
    };
    return (
        <div>
            {!isCodeSent && (
                <Alert
                    type={'info'}
                    style={{ margin: '16px 0' }}
                    description={
                        <Typography.Text>
                            Выберите способ подписания оферты. Будут использованы данные, указанные в аккаунте. С
                            офертой можно ознакомиться по{' '}
                            <a href={offerUrl} target={'_blank'} rel='noreferrer'>
                                ссылке
                            </a>
                            .
                        </Typography.Text>
                    }
                />
            )}
            {!isCodeSent && (
                <Row style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 0.5fr', alignItems: 'center' }}>
                    <Segmented
                        block
                        size={'large'}
                        // @ts-ignore
                        onChange={setTypeValue}
                        value={typeValue}
                        options={[
                            {
                                label: (
                                    <Row style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <MdOutlineSms /> СМС
                                    </Row>
                                ),
                                value: 'phone',
                            },
                            {
                                label: (
                                    <Row style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <MdEmail /> Email
                                    </Row>
                                ),
                                value: 'email',
                            },
                        ]}
                    />
                    <Button type={'text'} loading={isCallLoading || isEmailLoading} onClick={handleClick}>
                        Подтвердить
                    </Button>
                </Row>
            )}
            {isCodeSent && (
                <Col style={{ gap: 8 }}>
                    <Input
                        placeholder={
                            typeValue === 'phone' ? 'Последние 4 цифры номера входящего вызова' : 'Введите код с почты'
                        }
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <Row style={{ marginTop: 8, justifyContent: 'flex-end' }}>
                        <Button type={'primary'} loading={isConfirmationLoading} onClick={handleConfirmation}>
                            Подписать оферту
                        </Button>
                    </Row>
                </Col>
            )}
        </div>
    );
};
