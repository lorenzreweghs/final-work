import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import styles from '../styles/Map.module.css';

const Map = () => {
    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [4.7, 50.88], // starting position [lng, lat]
            zoom: 13 // starting zoom
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