// @ts-nocheck
import 'maplibre-gl/dist/maplibre-gl.css';

import { usePrevious } from '@dnd-kit/utilities';
import cn from 'clsx';
import { isEqual } from 'lodash-es';
import maplibregl, { Map as MapLibre } from 'maplibre-gl';
import React, { useEffect, useRef, useState } from 'react';

import { PlaceModel } from '@/models';
import { makeMapClusters } from '@/utils';

import darkStyle from './dark_matter.js';
import s from './map.module.scss';

const SOURCE_KEY = 'undefined'; //Мок

interface MapProps {
    places: Array<PlaceModel>;
    center?: Array<number | undefined>;
    className?: string;
}

export const Map = ({ places, center = [37.621075, 55.751133], className }: MapProps) => {
    const items = places?.map((place) => ({
        type: 'Feature',
        properties: {
            id: place.id,
            price: 0,
            title: place.name,
            description: place.brief_description,
            rating: place.rating,
        },
        geometry: {
            type: 'Point',
            coordinates: [+place.coords?.longitude, +place.coords?.latitude],
        },
    }));

    const data = { filters: null, coords: null, zoom: null };
    const prevFilters = usePrevious(data.filters);
    const map = useRef<MapLibre | null>(null);
    const [lng] = useState(center[0] ?? 37.621075);
    const [lat] = useState(center[1] ?? 55.751133);
    const [zoom] = useState(12);

    useEffect(() => {
        if (map.current) return;
        // @ts-ignore
        map.current = new maplibregl.Map({
            container: 'map',
            style: darkStyle,
            center: data.coords ?? [lng, lat],
            zoom: data.zoom ?? zoom,
            maxZoom: 18,
            minZoom: 7,
        });

        map.current.addControl(new maplibregl.NavigationControl({ showZoom: true }), 'top-left');

        map.current.on('load', (_e) => {
            if (!map.current) return;
            map.current.addSource(SOURCE_KEY, {
                type: 'geojson',
                cluster: true,
                data: {
                    type: 'FeatureCollection',
                    crs: {
                        type: 'name',
                        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
                    },
                    features: items,
                },
                clusterMaxZoom: 13, // Max zoom to cluster points on
                clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
            });

            // Добавление кластеров
            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: SOURCE_KEY,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'], '#fff', 100, '#f1f075', 750, '#f28cb1'],
                    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
                },
            });

            // Добавление циферки к количеству элементов в кластере
            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: SOURCE_KEY,
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-size': 12,
                },
            });

            // Некластеризованные точки
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: SOURCE_KEY,
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#e74362',
                    'circle-radius': 8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff',
                },
            });

            // Текст у некласторизованной точки (например, название или цена)
            // map.current.addLayer({
            //     id: 'unclustered-point-text',
            //     type: 'symbol',
            //     source: SOURCE_KEY,
            //     filter: ['!', ['has', 'point_count']],
            //     paint: {
            //         'text-halo-blur': 1,
            //         'text-halo-color': '#e74362',
            //         'text-halo-width': 4,
            //         'text-color': '#fff',
            //     },
            //     layout: {
            //         'text-field': ['get', 'rating'],
            //         'text-size': 14,
            //         'text-line-height': 2,
            //         'text-anchor': 'bottom',
            //     },
            // });

            map.current.on('click', 'clusters', function (e) {
                if (!map.current) return;
                const features = map.current?.queryRenderedFeatures(e.point, {
                    layers: ['clusters'],
                });
                const clusterId = features && features[0].properties.cluster_id;
                const source = map.current.getSource(SOURCE_KEY);

                source.getClusterExpansionZoom(clusterId, function (err, zoom) {
                    if (err || !map.current) return;

                    map.current.easeTo({
                        center:
                            features &&
                            features[0] &&
                            'coordinates' in features[0].geometry &&
                            features[0].geometry.coordinates,
                        zoom: zoom,
                    });
                });
            });

            map.current.on('click', 'unclustered-point', function (e) {
                if (e.features && e.features[0]) {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const properties = e.features[0].properties;
                    if (map.current instanceof MapLibre) {
                        new maplibregl.Popup().setLngLat(coordinates).setHTML(properties.title).addTo(map.current);
                    }

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }
                }
            });

            map.current.on('mouseenter', 'clusters', function () {
                if (map.current) {
                    map.current.getCanvas().style.cursor = 'pointer';
                }
            });
            // @ts-ignore
            map.current?.on('mouseleave', 'clusters', function () {
                if (map.current) {
                    map.current.getCanvas().style.cursor = '';
                }
            });
            // formRequest(e);
        });

        map.current.on('idle', (e) => {
            // formRequest(e);
        });
    }, []);

    useEffect(() => {
        if (!isEqual(data.filters, prevFilters) && prevFilters !== null) {
            if (map.current) {
                // @ts-ignore все есть
                map?.current?.getSource(SOURCE_KEY)?.setData(null);
            }
        }
    }, [data.filters]);

    useEffect(() => {
        if (items?.length && map.current && map.current.getSource(SOURCE_KEY)) {
            const d = makeMapClusters(items);
            console.log(items);
            // @ts-ignore все есть
            map.current.getSource(SOURCE_KEY).setData(d);
        } else {
            // if (items?.length === 0) {
            //     const d = makeMapClusters([]);
            //     // @ts-ignore все есть
            //     map?.current?.getSource(SOURCE_KEY)?.setData(d);
            // }
        }
    }, [items, map]);

    return (
        <div className={cn(s.mapWrap)}>
            <div className={cn(s.map, className)} id='map' />
        </div>
    );
};
