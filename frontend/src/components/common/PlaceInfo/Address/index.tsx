import { BsFillGeoAltFill } from 'react-icons/all';

import s from './styles.module.scss';

interface AddressProps {
    address: string;
    underground: unknown;
}

export const Address = ({ address, underground }: AddressProps) => {
    return (
        <address className={s.address}>
            <p className={s.street}>
                <BsFillGeoAltFill />
                {address}
            </p>
            {underground && <p />}
        </address>
    );
};
