import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { ref, onValue, get } from "firebase/database";
import Swal from 'sweetalert2';
import { Error } from '@mui/icons-material';

import useLocation, { db } from '../../src/hooks/useLocation';
import useSession, { MarkerTypes } from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';

import flagIcon from '../../public/flag_icon_color.png';
import tentIcon from '../../public/campground_icon.png';

import styles from '../../styles/Map.module.css';


const Map = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { updateLocation, addMarker } = useLocation();
    const { getUsersInSession, getMarkersInSession, updateUserStatus } = useSession();
    const { getUserName } = useOtherUser();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('XXXXXX');
    const [navIsOpen, setNavIsOpen] = useState(false);

    const [activeAction, setActiveAction] = useState('');

    const userList = useRef<string[]>([]);

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        const { session } = router.query;
        setActiveSession(session);
        
        const checkSession = async () => {
            userList.current = await getUsersInSession(session);
            if (!userList.current.includes(user?.sub!)) router.push('/');
        }
        checkSession();

        const setOnline = async () => {
            await updateUserStatus(user?.sub!, true);
        }
        setOnline();
    }, [router.isReady, isLoading]);

    useEffect(() => {
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
                    if (snapshot.val()) addUserSource(userId, userName);
                    else if (map.getSource(userName)) {
                        map.removeLayer(userId);
                        map.removeSource(userName);
                    }
                });
            }

            const addUserSource = async (userId: string, userName: string) => {                
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
                            'icon-image': 'rocket',
                            'icon-size': 1.5,
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
            onValue(ref(db, 'sessions/' + activeSession + '/users'), async (snapshot) => {
                if (firstTrigger) {
                    firstTrigger = false;
                    return;
                }
                const users = snapshot.val();
                const lastUserId = users.pop();
                checkStatus(lastUserId);
            });

            userList.current.forEach(async (userId: string) => {
                checkStatus(userId);
            });

            const setCurrentFlag = async () => {
                const [coords] = await getMarkersInSession(activeSession, MarkerTypes.flag);
                if (coords) {
                    map.loadImage(flagIcon.src, async (error, image) => {
                        if (error) throw error;
        
                        map.addImage('flag', image!);
    
                        const geojson = await getGeoJson(coords.lat, coords.lng);
                        map.addSource('flag', {
                            type: 'geojson',
                            data: geojson
                        });
            
                        map.addLayer({
                            'id': 'gather',
                            'type': 'symbol',
                            'source': 'flag',
                            'layout': {
                                'icon-image': 'flag',
                                'icon-size': 0.25,
                            }
                        });
                    });
                }
            }
            setCurrentFlag();

            const setCurrentTent = async () => {
                const [coords] = await getMarkersInSession(activeSession, MarkerTypes.tent);
                if (coords) {
                    map.loadImage(tentIcon.src, async (error, image) => {
                        if (error) throw error;
     
                        map.addImage('campground', image!);
    
                        const geojson = await getGeoJson(coords.lat, coords.lng);
                        map.addSource('campground', {
                            type: 'geojson',
                            data: geojson
                        });
        
                        map.addLayer({
                            'id': 'tent',
                            'type': 'symbol',
                            'source': 'campground',
                            'layout': {
                                'icon-image': 'campground',
                            }
                        });
                    });
                }
            }
            setCurrentTent();

            const setCurrentMarkers = async () => {
                const coordsArray = await getMarkersInSession(activeSession);
                if (coordsArray.length) {
                    coordsArray.forEach((coords) => {
                        const marker = new mapboxgl.Marker();
                        marker.setLngLat(coords).addTo(map);
                    })
                }
            }
            setCurrentMarkers();
        });

        map.on('click', (event) => {
            switch (activeAction) {
                case "gather":
                    handleGather(event);
                    break;
                case "tent":
                    handleTent(event);
                    break;
                case "pinpoint":
                    handlePinpoint(event);
                    break;
            }
        });

        const handleGather = async (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            const geojson = await getGeoJson(coords.lat, coords.lng);
            (map.getSource('flag') as GeoJSONSource).setData(geojson);

            setTimeout(() => {
                Swal.fire({
                    title: 'Vlag bevestigen',
                    text: "Zeker dat je het verzamelpunt wilt verplaatsen?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--color-primary-light)',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Vlag plaatsen',
                    cancelButtonText: 'Annuleren'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await addMarker(activeSession, [{lng: coords.lng, lat: coords.lat}], true);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        const [coords] = await getMarkersInSession(activeSession, MarkerTypes.flag);
                        const geojson = await getGeoJson(coords.lat, coords.lng);
                        (map.getSource('flag') as GeoJSONSource).setData(geojson);
                    }
                    setActiveAction("");
                });
            }, 1000);
        }

        const handleTent = async (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            const geojson = await getGeoJson(coords.lat, coords.lng);
            if (map.getSource('campground')) {
                (map.getSource('campground') as GeoJSONSource).setData(geojson);
            } else {
                map.loadImage(tentIcon.src, async (error, image) => {
                    if (error) throw error;
 
                    map.addImage('campground', image!);

                    map.addSource('campground', {
                        type: 'geojson',
                        data: geojson
                    });
    
                    map.addLayer({
                        'id': 'tent',
                        'type': 'symbol',
                        'source': 'campground',
                        'layout': {
                            'icon-image': 'campground',
                        }
                    });
                });
            }

            setTimeout(() => {
                Swal.fire({
                    title: 'Locatie op camping bevestigen',
                    text: "Zeker dat je hier de locatie van jullie tenten wilt plaatsen?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--color-primary-light)',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Pinpoint plaatsen',
                    cancelButtonText: 'Annuleren'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await addMarker(activeSession, [{lng: coords.lng, lat: coords.lat}], false, true);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        const [coords] = await getMarkersInSession(activeSession, MarkerTypes.tent);
                        if (coords) {
                            const geojson = await getGeoJson(coords.lat, coords.lng);
                            (map.getSource('campground') as GeoJSONSource).setData(geojson);                            
                        } else {
                            map.removeLayer('tent');
                            map.removeSource('campground');
                        }
                    }
                    setActiveAction("");
                });
            }, 1000);
        }

        const handlePinpoint = async (event: mapboxgl.MapMouseEvent) => {
            const markerArray = await getMarkersInSession(activeSession);

            const marker = new mapboxgl.Marker();
            const coords = event.lngLat;
            marker.setLngLat(coords).addTo(map);

            setTimeout(() => {
                Swal.fire({
                    title: 'Pinpoint bevestigen',
                    text: "Zeker dat je een pinpoint wilt plaatsen?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--color-primary-light)',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Pinpoint plaatsen',
                    cancelButtonText: 'Annuleren'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await addMarker(activeSession, [...markerArray, {lng: coords.lng, lat: coords.lat}]);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        marker.remove();
                    }
                    setActiveAction("");
                });
            }, 1000);
        }

        navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, { enableHighAccuracy: true });
    }, [activeAction, activeSession]);

    useEffect(() => {
        if (isLoading) return;
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
    }, [isLoading]);

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

    const Notification = () => {
        let htmlString: ReactElement = <p></p>;
        switch (activeAction) {
            case 'gather':
                htmlString = <p>Klik op de kaart om het <span>verzamelpunt</span> te bepalen</p>;
                break;
            case 'tent':
                htmlString = <p>Klik op de kaart om de <span>locatie van je tent</span> aan te geven</p>;
                break;
            case 'pinpoint':
                htmlString = <p>Klik op de kaart om een <span>pinpoint</span> te plaatsen</p>;
                break;
        }
        return (
            <div className={styles.notification}>
                <Error />
                {htmlString}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div id='map' className={styles.map} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} />
            </div>
            {activeAction && <Notification />}
            <div className={styles.actions}>
                <div onClick={() => {
                    if (activeAction === 'gather') setActiveAction('');
                    else setActiveAction('gather');
                }}>
                    <Action type={ActionTypes.gather} isActive={activeAction === 'gather'} />
                </div>
                <div onClick={() => {
                    if (activeAction === 'tent') setActiveAction('');
                    else setActiveAction('tent');
                }}>
                    <Action type={ActionTypes.tent} isActive={activeAction === 'tent'} />
                </div>
                <div onClick={() => {
                    if (activeAction === 'pinpoint') setActiveAction('');
                    else setActiveAction('pinpoint');
                }}>
                    <Action type={ActionTypes.pinpoint} isActive={activeAction === 'pinpoint'} />
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps = withPageAuthRequired();

export default Map;