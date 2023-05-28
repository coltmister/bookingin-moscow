import { PlaceModel } from '@/models';

export const makeMapClusters = (items: Array<PlaceModel>) => {
    return {
        type: 'FeatureCollection',
        crs: {
            type: 'name',
            properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
        },
        features: items.map((item) => ({
            type: 'Feature',
            properties: {
                id: item.id,
                // price: item.price,
                // title: item.title,
                // description: item.description,
            },
            geometry: {
                type: 'Point',
                coordinates: item.coords,
            },
        })),
    };
};
