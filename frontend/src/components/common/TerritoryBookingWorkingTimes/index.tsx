import { Tabs, Typography } from 'antd';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useGetWorkingHoursQuery } from '../../../services/TerritoryBookingService/TerritoryBooking.service';
import { WorkingTimesForm } from '../WorkingTimesForm';
import { WORKING_TIMES } from './config';

export const TerritoryBookingWorkingTimes = () => {
    const params = useParams();
    const territoryId = params.territoryId ?? '';
    const { data, isLoading, isFetching } = useGetWorkingHoursQuery(territoryId, { skip: !territoryId });

    const dates = useMemo(() => {
        if (data) {
            if (data.length < 7) {
                const arr = new Array(7).fill(null);
                data?.forEach((item) => (arr[item.weekday.id] = item));
                return arr;
            }
            return data;
        }
        return [];
    }, [data]);
    return (
        <div>
            {!isLoading && Array.isArray(data) && (
                <Tabs
                    tabPosition={'left'}
                    items={WORKING_TIMES.map((label, i) => {
                        return {
                            label: <Typography.Text style={{ opacity: 0.7 }}>{label}</Typography.Text>,
                            key: String(i),
                            children: !isFetching && (
                                <WorkingTimesForm key={i} activeWeekday={i} defaultItem={dates[i]} />
                            ),
                        };
                    })}
                />
            )}
        </div>
    );
};
