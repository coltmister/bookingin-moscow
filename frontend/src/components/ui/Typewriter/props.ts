import { HtmlHTMLAttributes, Ref } from 'react';

import { Range } from '@/utility-types';
interface TypewriterProps {
    sequence: Sequence;
    repeat?: number | boolean;
    wrapper?: Wrapper;
    cursor?: boolean;
    speed?: Speed | GranularSpeed;
    deletionSpeed?: Speed | GranularSpeed;
    omitDeletionAnimation?: boolean;
}

export interface TypeAnimationProps extends TypewriterProps, HtmlHTMLAttributes<HTMLElement['style']> {
    ref?: Ref<HTMLElementTagNameMap[Wrapper]>;
}

export type GranularSpeed = {
    type: 'keyStrokeDelayInMs';
    value: number;
};

type Speed = Range<1, 99>;

export type Wrapper = keyof HTMLElementTagNameMap;

type Sequence = Array<SequenceElement>;
type SequenceElement = string | number | ((element: HTMLElement | null) => void | Promise<void>);
