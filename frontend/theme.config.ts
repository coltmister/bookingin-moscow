import { ThemeConfig } from 'antd/es/config-provider/context';

export const theme: ThemeConfig = {
    token: {
        colorPrimary: '#e74362',
        colorSuccess: '#70d73e',
        colorWarning: '#ff8341',
        colorTextBase: '#000106',
        colorTextPlaceholder: '#585858',
        fontFamily: 'Cera Pro, Verdana, sans-serif',
    },
    components: {
        Button: {
            lineHeight: 1,
            colorText: 'var(--color-primary)',
            fontSize: 17,
            controlHeightLG: 45,
        },
        Typography: {
            margin: 0,
            marginLG: 0,
            sizeMarginHeadingVerticalEnd: 0,
            colorTextHeading: '#fff',
            colorTextBase: 'var(--color-text-base)',
        },
    },
};
