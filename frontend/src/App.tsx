import 'dayjs/locale/ru.js';
import './assets/styles/styles.scss';

import { ConfigProvider } from 'antd';
import ru from 'antd/locale/ru_RU';
import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { useAuth } from '@/hooks';
import { router } from '@/pages';
import { Spinner } from '@/ui';

import { theme } from '../theme.config';
import { store } from './store';

export const App = () => {
    const { isValidated } = useAuth();

    return (
        <Provider store={store}>
            <ConfigProvider theme={theme} locale={ru}>
                {/* TODO: ломается, проверить */}
                {/*{!isValidated && <Spinner className='progress-center ant-spin' />}*/}
                <RouterProvider router={router} />
            </ConfigProvider>
        </Provider>
    );
};
