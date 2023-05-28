import { Row } from 'antd';
import React from 'react';

import { UserCalendar } from '../../common/UserCalendar';

export const UserBookings = () => {
    return (
        <div>
            <Row wrap={false} style={{ gap: 8, margin: '16px 0' }}>
                <h2>Ваши бронирования</h2>
            </Row>
            <UserCalendar />
        </div>
    );
};
