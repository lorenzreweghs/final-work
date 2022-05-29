import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { ref, onValue, get } from "firebase/database";

import useLocation, { db } from '../../src/hooks/useLocation';
import useSession from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';

import styles from '../../styles/Map.module.css';

const Map = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { updateLocation } = useLocation();
    const { getUsersInSession, updateUserStatus } = useSession();
    const { getUserName } = useOtherUser();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>("XXXXXX");
    const [navIsOpen, setNavIsOpen] = useState(false);

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        const { session } = router.query;
        setActiveSession(session);

        let userList: string[];
        const checkSession = async () => {
            userList = await getUsersInSession(session);
            if (!userList.includes(user?.sub!)) router.push('/');
        }
        checkSession();

        const setOnline = async () => {
            await updateUserStatus(user?.sub!, true);
        }
        setOnline();

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/lorenzreweghs/cl3k3d254001f14mnykkhv9ct',
            center: [4.68111496672563, 50.9683219343008],
            zoom: 15,
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
            
            const checkStatus = async (userId: string) => {
                onValue(ref(db, 'users/' + userId + '/online'), async (snapshot) => {
                    const userName = await getUserName(userId);
                    if (snapshot.val()) addSource(userId, userName);
                    else if (map.getSource(userName)) {
                        map.removeLayer(userId);
                        map.removeSource(userName);
                    }
                });
            }

            const addSource = async (userId: string, userName: string) => {                
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
                checkStatus(lastUserId);
            });

            userList.forEach(async (userId: string) => {
                checkStatus(userId);
            });
        });

        navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, { enableHighAccuracy: true });
        
        document.addEventListener("visibilitychange", async () => {
            if (document.visibilityState === 'visible') {
                await updateUserStatus(user?.sub!, true);
            } else if (document.visibilityState === 'hidden') {
                await updateUserStatus(user?.sub!, false);
            }
        });

        window.addEventListener("pagehide", async () => {
            await updateUserStatus(user?.sub!, false);
        }, false);

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
        <div className={styles.container}>
            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div id='map' className={styles.map} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} />
            </div>
            <div className={styles.actions}>
                <div>
                    <Action type={ActionTypes.gather} />
                </div>
                <div>
                    <Action type={ActionTypes.tent} />
                </div>
                <div>
                    <Action type={ActionTypes.pinpoint} />
                </div>          
            </div>
        </div>
    );
}

export const getServerSideProps = withPageAuthRequired();

export default Map;