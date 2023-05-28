import { Button, Input } from 'antd';
import React, { FormEvent, useState } from 'react';
import { MdSearch } from 'react-icons/md';

import { useRouter } from '@/hooks';
import { Container, Row } from '@/ui';

import s from './style.module.scss';

export const SearchAI = () => {
    const [prompt, setPrompt] = useState<string>('');
    const { history } = useRouter();
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        history('/places?search=' + prompt + '&ai=1');
    };
    return (
        <form onSubmit={onSubmit}>
            <Container className={s.container}>
                <Row lg={10} md={8}>
                    <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        size={'large'}
                        placeholder={'Где я могу найти кафе?'}
                    />
                </Row>
                <Row lg={2} md={8}>
                    <Button htmlType='submit' size='large' type='primary' icon={<MdSearch />}>
                        Искать
                    </Button>
                </Row>
            </Container>
        </form>
    );
};
