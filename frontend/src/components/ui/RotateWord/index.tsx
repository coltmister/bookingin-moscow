import React from 'react';

import s from './styles.module.scss';

interface RotateWordProps {
    words: Array<string>;
    delay?: number;
}

export const RotateWord = ({ words, delay = 3 }: RotateWordProps) => {
    return (
        <span
            className={s.changer}
            style={{
                '--delay': delay,
            }}
        >
            {words.map((word, idx) => (
                <span key={word + idx}>{word}</span>
            ))}
        </span>
    );
};
