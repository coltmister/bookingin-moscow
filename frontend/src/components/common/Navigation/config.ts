interface LinksModel {
    id: string | number;
    to: string;
    label: string;
}

export const links: LinksModel[] = [
    { id: 0, to: '/', label: 'главная' },
    { id: 1, to: '/places', label: 'каталог площадок' },
];
