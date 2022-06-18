import React from "react";
import { StaticImageData } from "next/image";
import { Timestamp } from "firebase/firestore";

import { ActivityType } from "../hooks/useProgress";
import { ChallengeType } from "../hooks/useChallenge";

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

export const addSourceWithImage = (map: React.MutableRefObject<mapboxgl.Map | null>, icon: StaticImageData, id: string, coords: {lng: number, lat: number}, layerArray: string[], size: number = 1, minzoom: number = 14) => {
    map.current!.loadImage(icon.src, async (error, image) => {
        if (error) throw error;

        if (!map.current!.hasImage(`${id}-image`)) {
            map.current!.addImage(`${id}-image`, image!);
        }

        if (map.current!.getLayer(`${id}-layer`)) {
            map.current!.removeLayer(`${id}-layer`);
        }

        if (map.current!.getSource(`${id}`)) {
            map.current!.removeSource(`${id}`);
        }

        const geojson = await getGeoJson(coords.lat, coords.lng);
        map.current!.addSource(`${id}`, {
            type: 'geojson',
            data: geojson
        });

        map.current!.addLayer({
            'id': `${id}-layer`,
            'type': 'symbol',
            'source': `${id}`,
            'layout': {
                'icon-image': `${id}-image`,
                'icon-size': size,
                'icon-allow-overlap': true,
            },
            'minzoom': minzoom,
            'maxzoom': 24,
        });
        layerArray.push(`${id}-layer`);
    });
}

export const sortOnLast = (a: ActivityType, b: ActivityType) => {
    if (!a.completedAt && !b.completedAt) return 0;
    if (!a.completedAt && b.completedAt) return 1;
    if (a.completedAt && !b.completedAt) return -1;
    if (
        new Timestamp(a.completedAt!.seconds, a.completedAt!.nanoseconds)
          .toDate()
          .getTime() >
        new Timestamp(b.completedAt!.seconds, b.completedAt!.nanoseconds)
          .toDate()
          .getTime()
      ) {
        return 1;
      }
      if (
        new Timestamp(a.completedAt!.seconds, a.completedAt!.nanoseconds)
          .toDate()
          .getTime() <
        new Timestamp(b.completedAt!.seconds, b.completedAt!.nanoseconds)
          .toDate()
          .getTime()
      ) {
        return -1;
      }
    return 0;
}

export const sortOnRecent = (a: ChallengeType, b: ChallengeType) => {
    if (!a.isConfirmed && b.isConfirmed) return 1;
    if (a.isConfirmed && !b.isConfirmed) return -1;
    if (
        new Timestamp(a.createdAt.seconds, a.createdAt.nanoseconds)
          .toDate()
          .getTime() >
        new Timestamp(b.createdAt.seconds, b.createdAt.nanoseconds)
          .toDate()
          .getTime()
      ) {
        return -1;
      }
      if (
        new Timestamp(a.createdAt.seconds, a.createdAt.nanoseconds)
          .toDate()
          .getTime() <
        new Timestamp(b.createdAt.seconds, b.createdAt.nanoseconds)
          .toDate()
          .getTime()
      ) {
        return 1;
      }
    return 0;
}
