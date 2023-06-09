import React from 'react';
import ReactDOM from 'react-dom/client';

import { AuthProvider } from '@/contexts';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
