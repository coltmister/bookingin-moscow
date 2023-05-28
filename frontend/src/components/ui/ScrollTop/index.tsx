import { FloatButton } from 'antd';
import { BsChevronUp } from 'react-icons/all';

export const ScrollTop = () => {
    return <FloatButton.BackTop shape='square' icon={<BsChevronUp />} />;
};
