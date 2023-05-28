import { isNumber } from 'lodash-es';
import React, { ElementType, forwardRef, HTMLAttributes } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useForwardRef } from '@/hooks';

import { type, type as typeloop } from './helpers';
import { GranularSpeed, TypeAnimationProps, Wrapper } from './props';
import s from './styles.module.scss';

const DEFAULT_SPEED = 40;
export const Typewriter = forwardRef<
    HTMLElementTagNameMap[Wrapper],
    TypeAnimationProps & HTMLAttributes<HTMLElementTagNameMap[Wrapper]>
>(
    (
        {
            sequence,
            repeat = Infinity,
            className,
            speed = DEFAULT_SPEED,
            deletionSpeed,
            omitDeletionAnimation = false,
            wrapper = 'span',
            cursor = true,
            style,
        },
        ref
    ) => {
        if (!deletionSpeed) {
            deletionSpeed = speed;
        }

        const normalizedSpeeds = new Array(2).fill(DEFAULT_SPEED);

        [speed, deletionSpeed].forEach((s, i) => {
            switch (typeof s) {
                case 'number': {
                    normalizedSpeeds[i] = Math.abs(s - 100);
                    break;
                }
                case 'object': {
                    const { type, value } = s as GranularSpeed;
                    if (!isNumber(value)) {
                        break;
                    }
                    switch (type) {
                        case 'keyStrokeDelayInMs': {
                            normalizedSpeeds[i] = value;
                            break;
                        }
                    }
                    break;
                }
            }
        });

        const keyStrokeDelayTyping = normalizedSpeeds[0];
        const keyStrokeDelayDeleting = normalizedSpeeds[1];

        //@ts-ignore check
        const typeRef = useForwardRef<HTMLElement>(ref);

        const baseStyle = s.type;
        let finalClassName;
        if (className) {
            finalClassName = `${cursor ? baseStyle + ' ' : ''}${className}`;
        } else {
            finalClassName = cursor ? baseStyle : '';
        }

        useEffectOnce(() => {
            let seq = sequence;
            let tl;

            if (repeat === Infinity || repeat === true) {
                tl = typeloop;
            } else if (isNumber(repeat)) {
                seq = Array(1 + repeat)
                    .fill(sequence)
                    .flat();
            }

            type(typeRef.current, keyStrokeDelayTyping, keyStrokeDelayDeleting, omitDeletionAnimation, ...seq, tl);

            return () => {
                typeRef.current;
            };
        });

        const WrapperEl = wrapper as ElementType;

        return <WrapperEl style={style} className={finalClassName} ref={typeRef} />;
    }
);

Typewriter.displayName = 'Typewriter';
