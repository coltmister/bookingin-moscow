import { Layout } from 'antd';
import cn from 'clsx';
import { PropsWithChildren, ReactNode } from 'react';

import { Footer } from './Footer';
import { Header } from './Header';
import { Main } from './Main';
import s from './styles.module.scss';

interface RootLayout {
    sidebar?: ReactNode;
}

export const RootLayout = ({ children, sidebar }: PropsWithChildren<RootLayout>) => {
    return (
        <div className={cn(s.rootLayout, s.application)}>
            <Header className={s.header} />
            {sidebar && (
                <Layout className={cn(s.layout, s.main)}>
                    {sidebar}
                    <Main>{children}</Main>
                </Layout>
            )}
            {!sidebar && <Main>{children}</Main>}

            <Footer className={s.footer} />
        </div>
    );
};
