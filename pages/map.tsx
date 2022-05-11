import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import styles from '../styles/Map.module.css';

const Map = () => {
    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [4.7, 50.88],
            zoom: 13
        });

        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        map.addControl(geolocate);
        map.on('load', () => {
            geolocate.trigger();
        });
    }, []);

    return (
        <div id='map' className={styles.map} />
    );
}

export default Map;