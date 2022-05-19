import { useEffect } from 'react';
import { useRouter } from 'next/router';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { ref, onValue, get } from "firebase/database";

import useLocation, { db } from '../../src/hooks/useLocation';
import useSession from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';

import styles from '../../styles/Map.module.css';

const Map = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { updateLocation } = useLocation();
    const { getUsersInSession } = useSession();
    const { getUserName } = useOtherUser();

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        const { session } = router.query;
        // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event

        let userList: string[];
        const checkSession = async () => {
            userList = await getUsersInSession(session);
            if (!userList.includes(user?.sub!)) router.push('/');
        }
        checkSession();

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [4.7, 50.88],
            zoom: 16,
        });

        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        map.addControl(geolocate);
        map.on('load', async () => {
            geolocate.trigger();

            const addSource = async (userId: string) => {
                const userName = await getUserName(userId);
                await get(ref(db, 'users/' + userId + '/coords')).then(async (snapshot) => {
                    const {lat, lng} = snapshot.val();
                    const geojson = await getGeoJson(lat, lng);
                    map.addSource(userName, {
                        type: 'geojson',
                        data: geojson
                    });

                    map.addLayer({
                        'id': userId,
                        'type': 'symbol',
                        'source': userName,
                        'layout': {
                        // This icon is a part of the Mapbox Streets style.
                        // To view all images available in a Mapbox style, open
                        // the style in Mapbox Studio and click the "Images" tab.
                        // To add a new image to the style at runtime see
                        // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                        'icon-image': 'rocket-15'
                        }
                    });
                });
                
                onValue(ref(db, 'users/' + userId + '/coords'), async (snapshot) => {
                    const {lat, lng} = snapshot.val();
                    const geojson = await getGeoJson(lat, lng);
                    (map.getSource(userName) as GeoJSONSource).setData(geojson);
                });
            }

            let firstTrigger = true;
            onValue(ref(db, 'sessions/' + session), async (snapshot) => {
                if (firstTrigger) {
                    firstTrigger = false;
                    return;
                }
                const users = snapshot.val();
                const lastUserId = users.pop();
                addSource(lastUserId);
            });

            userList.forEach(async (userId: string) => {
                addSource(userId);
            });
        });

        navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, { enableHighAccuracy: true });            
    }, [router.isReady, isLoading]);

    const getGeoJson = (lat: number, lng: number): any => {
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

    const handlePositionUpdate = (pos: any) => {
        if (user) updateLocation(user.sub!, pos.coords.longitude, pos.coords.latitude);
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