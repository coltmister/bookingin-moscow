import { v4 as uuidv4 } from 'uuid';

export interface DefaultTab<T> {
    type: string;
    key: string;
    label: string;
    values: T;
    deletable?: boolean;
}

export interface HeroForm {
    title: null | string;
    image: null | string;
    description: null | string;
    isActionButtonShown: boolean;
}

export interface Advantage {
    text: string | null;
    icon: string | null;
}

export interface AdvantagesForm {
    advantages: Array<Advantage>;
    title: null | string;
}

export const defaultHero: () => DefaultTab<HeroForm> = () => ({
    type: 'hero',
    key: 'hero-' + uuidv4(),
    deletable: false,
    label: 'Hero-секция',
    values: {
        title: null,
        image: null,
        description: null,
        isActionButtonShown: false,
    },
});

export const defaultAdvantages: () => DefaultTab<AdvantagesForm> = () => ({
    type: 'advantages',
    key: 'advantages-' + uuidv4(),
    label: 'Hero-секция',
    values: {
        title: null,
        advantages: [],
    },
});

export const defaultAdvantage: Advantage = { text: null, icon: null };

export const defaultBlockMap = {
    advantages: defaultAdvantages,
};
