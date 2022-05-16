import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';

import useLocation from '../src/hooks/useLocation';

import styles from '../styles/Map.module.css';

const Map = () => {
    const { user, error, isLoading } = useUser();

    const { updateLocation } = useLocation();

    useEffect(() => {
        if (!isLoading) {
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

            navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, { enableHighAccuracy: true });            
        }
    }, [isLoading]);

    const handlePositionUpdate = (pos: any) => {
        if (user) updateLocation(user.sub!, user.name!, pos.coords.longitude, pos.coords.latitude);
    }

    const handlePositionError = (err: any) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    }

    return (
        <div id='map' className={styles.map} />
    );
}

export const getServerSideProps = withPageAuthRequired();

export default Map;