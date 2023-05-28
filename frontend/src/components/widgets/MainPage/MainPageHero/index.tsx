import { Segmented, Typography } from 'antd';
import React from 'react';
import { BsStars, FiFilter } from 'react-icons/all';
import { useToggle } from 'usehooks-ts';

import { Hero, SearchEntity } from '@/components';
import { useIsLarge } from '@/hooks';
import { Container, Row, Typewriter } from '@/ui';

import { SearchAI } from '../../../common/SearchAI';
import s from './styles.module.scss';

const segmentedOptions = [
    {
        label: 'Фильтры',
        value: 'filters',
        icon: <FiFilter />,
    },
    {
        label: 'AI',
        value: 'ai',
        icon: <BsStars />,
    },
];

export const MainPageHero = () => {
    const isLarge = useIsLarge();
    const [isAI, toggleAI] = useToggle();

    const textRender = (
        <Typography.Title className={s.title}>
            Найди{' '}
            <span hidden={isLarge} className={s.word}>
                площадку
            </span>
            {isLarge && (
                <Typewriter
                    className={s.word}
                    repeat
                    sequence={['студию', 2500, 'площадку', 2500, 'пространство', 2500]}
                />
            )}
            для реализации <br /> своей креативной идеи
        </Typography.Title>
    );

    return (
        <Hero className={s.hero} text={textRender} image={''}>
            {isAI ? <SearchAI /> : <SearchEntity />}
            <Container className={s.buttonContainer}>
                <Segmented size={'large'} onChange={toggleAI} options={segmentedOptions} />
            </Container>
        </Hero>
    );
};
