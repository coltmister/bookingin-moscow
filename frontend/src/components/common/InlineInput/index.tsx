import { Button, Descriptions, Typography } from 'antd';
import React, { forwardRef, ReactNode, Ref, useRef, useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { RefCallBack } from 'react-hook-form/dist/types/form';
import { BsCheckLg } from 'react-icons/all';
import { useOnClickOutside } from 'usehooks-ts';

import s from './style.module.scss';

interface InlineInputProps extends ControllerRenderProps<FieldValues> {
    label: ReactNode;
}

export const InlineInput = forwardRef<Ref<RefCallBack>, InlineInputProps>(function InlineInput(
    { label, ...field },
    ref
) {
    const outsideClickRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(outsideClickRef, () => setEditing(false));
    const [editing, setEditing] = useState(false);

    const onEditingHandler = () => setEditing(!editing);
    return (
        <Descriptions className={s.field}>
            <Descriptions.Item className={s.label} label={label}>
                <div className={s.wrapper} ref={outsideClickRef}>
                    <Typography.Paragraph
                        className={s.input}
                        // @ts-ignore Илья, забей на этот тип, в понедельник можешь допилить
                        ref={ref}
                        onClick={onEditingHandler}
                        editable={{
                            editing,
                            enterIcon: null,
                            ...field,
                        }}
                    >
                        {field.value}
                    </Typography.Paragraph>
                    <Button
                        htmlType={'submit'}
                        hidden={!editing}
                        onClick={onEditingHandler}
                        className={s.submitButton}
                        type='text'
                    >
                        <BsCheckLg color={'#4caf50'} />
                    </Button>
                </div>
            </Descriptions.Item>
        </Descriptions>
    );
});
