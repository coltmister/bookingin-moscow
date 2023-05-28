declare module '*.svg' {
    import * as React from 'react';

    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
}

import 'react';
declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}
