/// <reference types="vite/client.d.ts" />

import 'react';
declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}
