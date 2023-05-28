import { useEffect, useState } from 'react';

export const useIsScroll = (): boolean => {
    const [scrollHeight, setScrollHeight] = useState<number>(0);
    const [clientHeight, setClientHeight] = useState<number>(0);

    const [hasScroll, setScroll] = useState<boolean>(false);

    useEffect(() => {
        setScrollHeight(document.documentElement.scrollHeight);
        setClientHeight(document.documentElement.clientHeight);

        setScroll(scrollHeight > clientHeight);
    });

    return hasScroll;
};
