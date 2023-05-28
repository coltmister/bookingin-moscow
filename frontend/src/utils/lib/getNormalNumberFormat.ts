export const getNormalNumberFormat = (num: string | number | undefined): string =>
    num ? num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
