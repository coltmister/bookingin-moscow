import { Button } from 'antd';
import { BsChevronLeft } from 'react-icons/all';

import { useRouter } from '@/hooks';

export const Back = () => {
    const { history } = useRouter();

    return (
        <Button type='link' icon={<BsChevronLeft />} onClick={() => history(-1)}>
            назад
        </Button>
    );
};
