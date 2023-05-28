import { throttle } from 'lodash-es';
import { useEffect, useState } from 'react';

export const useDocumentToScrollThrottled = (
    callback: ({ previousScrollTop, currentScrollTop }: { [k: string]: number }) => void
) => {
    const [, setScrollPosition] = useState(0);
    let previousScrollTop = 0;

    const handleDocumentScroll = () => {
        const { scrollTop: currentScrollTop } = document.documentElement || document.body;

        setScrollPosition((previousPosition) => {
            previousScrollTop = previousPosition;
            return currentScrollTop;
        });

        callback({ previousScrollTop, currentScrollTop });
    };

    const handleDocumentScrollThrottled = throttle(handleDocumentScroll, 250);

    useEffect(() => {
        window.addEventListener('scroll', handleDocumentScrollThrottled);

        return () => window.removeEventListener('scroll', handleDocumentScrollThrottled);
    }, []);
};
