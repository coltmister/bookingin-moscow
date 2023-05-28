import { OrderedListOutlined, StarOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent, PointerSensor, useSensor } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Button } from 'antd';
import { Divider, Dropdown, MenuProps, Tabs } from 'antd';
import cn from 'clsx';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { DraggableTab } from '@/ui';

import { defaultBlockMap, defaultHero } from '../../../../utils';
import s from './style.module.scss';

export const LandingOrder = () => {
    const { fields, append, move, remove } = useFieldArray({
        name: 'landing',
    });

    useEffect(() => {
        if (fields.length === 0) {
            append(defaultHero());
        }
    }, [fields]);

    const [className, setClassName] = useState('');

    const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            // @ts-ignore разберусь позже
            const activeIndex = fields.findIndex((i) => i.key === active.id);
            // @ts-ignore разберусь позже
            const overIndex = fields.findIndex((i) => i.key === over?.id);
            move(activeIndex, overIndex);
        }
    };

    const handleClick: MenuProps['onClick'] = (event) => {
        if (event.key in defaultBlockMap) {
            // @ts-ignore разерусь позже
            const generateBlock = defaultBlockMap[event.key];
            append(generateBlock());
        }
    };

    const blocks: MenuProps['items'] = [
        {
            icon: <StarOutlined />,
            label: 'Преимущества',
            key: 'advantages',
            onClick: handleClick,
        },
        {
            icon: <OrderedListOutlined />,
            label: 'Текстовый блок',
            key: 'text',
            onClick: handleClick,
        },
    ];

    return (
        <Tabs
            className={cn(className, s.tabs)}
            // @ts-ignore
            items={fields}
            tabPosition='left'
            renderTabBar={(tabBarProps, DefaultTabBar) => (
                <div className={s.tabbar}>
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={fields.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                            <DefaultTabBar {...tabBarProps}>
                                {(node) => (
                                    <DraggableTab {...node.props} key={node.key} onActiveBarTransform={setClassName}>
                                        {node}
                                    </DraggableTab>
                                )}
                            </DefaultTabBar>
                        </SortableContext>
                    </DndContext>
                    <Divider />
                    <Dropdown menu={{ items: blocks }} placement='bottomLeft' arrow>
                        <Button>Добавить блок</Button>
                    </Dropdown>
                </div>
            )}
        />
    );
};
