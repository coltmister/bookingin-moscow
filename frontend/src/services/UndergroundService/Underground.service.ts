import { Api } from '@/services';

export const UndergroundService = Api.enhanceEndpoints({}).injectEndpoints({
    endpoints: (build) => ({
        getStationsList: build.query({
            query: () => '/sites/common/underground',
        }),
    }),
});

export const { useGetStationsListQuery } = UndergroundService;
