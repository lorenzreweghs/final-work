import React from "react";
import { StaticImageData } from "next/image";

export const getGeoJson = (lat: number, lng: number): any => {
    return {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [lng, lat],
                }
            }
        ]
    };
}

export const addSourceWithImage = (map: React.MutableRefObject<mapboxgl.Map | null>, icon: StaticImageData, id: string, coords: {lng: number, lat: number}, size: number = 1, minzoom: number = 14) => {
    map.current!.loadImage(icon.src, async (error, image) => {
        if (error) throw error;

        map.current!.addImage(`${id}-image`, image!);

        const geojson = await getGeoJson(coords.lat, coords.lng);
        map.current!.addSource(`${id}-source`, {
            type: 'geojson',
            data: geojson
        });

        map.current!.addLayer({
            'id': `${id}-layer`,
            'type': 'symbol',
            'source': `${id}-source`,
            'layout': {
                'icon-image': `${id}-image`,
                'icon-size': size,
                'icon-allow-overlap': true,
            },
            'minzoom': minzoom,
            'maxzoom': 24,
        });
    });
}
