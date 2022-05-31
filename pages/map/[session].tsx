import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import mapboxgl, { GeoJSONSource, Map } from 'mapbox-gl';
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


const SessionMap = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { updateLocation, addMarker } = useLocation();
    const { getUsersInSession, getMarkersInSession, updateUserStatus } = useSession();
    const { getUserName } = useOtherUser();

    const mapContainer = useRef(null);
    const map = useRef<Map | null>(null);
    const [lng, setLng] = useState(4.68111496672563);
    const [lat, setLat] = useState(50.9683219343008);
    const [zoom, setZoom] = useState(15);

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
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
        if (map.current) return;
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/lorenzreweghs/cl3k3d254001f14mnykkhv9ct',
            center: [lng, lat],
            zoom: zoom
        });

        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        map.current!.addControl(geolocate);
        map.current!.on('load', () => {
            geolocate.trigger();
        });
    });

    useEffect(() => {
        if (!map.current) return;
        map.current.on('move', () => {
            setLng(map.current!.getCenter().lng);
            setLat(map.current!.getCenter().lat);
            setZoom(map.current!.getZoom());
        });
    });

    useEffect(() => {
        if (!activeSession || !map.current) return;

        map.current!.on('load', async () => {
            const checkStatus = async (userId: string) => {
                onValue(ref(db, 'users/' + userId + '/online'), async (snapshot) => {
                    const userName = await getUserName(userId);
                    if (snapshot.val()) addUserSource(userId, userName);
                    else if (map.current!.getSource(userName)) {
                        map.current!.removeLayer(userId);
                        map.current!.removeSource(userName);
                    }
                });
            }

            const addUserSource = async (userId: string, userName: string) => {                
                await get(ref(db, 'users/' + userId + '/coords')).then(async (snapshot) => {
                    const {lat, lng} = snapshot.val();
                    const geojson = await getGeoJson(lat, lng);
                    map.current!.addSource(userName, {
                        type: 'geojson',
                        data: geojson
                    });

                    map.current!.addLayer({
                        'id': userId,
                        'type': 'symbol',
                        'source': userName,
                        'layout': {
                            'icon-image': 'rocket',
                            'icon-size': 1.5,
                        }
                    });
                });
                
                onValue(ref(db, 'users/' + userId + '/coords'), async (snapshot) => {
                    const {lat, lng} = snapshot.val();
                    const geojson = await getGeoJson(lat, lng);
                    (map.current!.getSource(userName) as GeoJSONSource).setData(geojson);
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
                    map.current!.loadImage(flagIcon.src, async (error, image) => {
                        if (error) throw error;
        
                        map.current!.addImage('flag', image!);
    
                        const geojson = await getGeoJson(coords.lat, coords.lng);
                        map.current!.addSource('flag', {
                            type: 'geojson',
                            data: geojson
                        });
            
                        map.current!.addLayer({
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
                    map.current!.loadImage(tentIcon.src, async (error, image) => {
                        if (error) throw error;
     
                        map.current!.addImage('campground', image!);
    
                        const geojson = await getGeoJson(coords.lat, coords.lng);
                        map.current!.addSource('campground', {
                            type: 'geojson',
                            data: geojson
                        });
        
                        map.current!.addLayer({
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
                        marker.setLngLat(coords).addTo(map.current!);
                    })
                }
            }
            setCurrentMarkers();
        });

        navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, { enableHighAccuracy: true });
    }, [activeSession]);

    useEffect(() => {
        if (!activeSession || !activeAction || !map.current) return;

        map.current!.on('click', (event) => {
            console.log(activeAction);
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
            console.log('handleGather');
            const coords = event.lngLat;
            const geojson = await getGeoJson(coords.lat, coords.lng);
            (map.current!.getSource('flag') as GeoJSONSource).setData(geojson);

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
                        (map.current!.getSource('flag') as GeoJSONSource).setData(geojson);
                    }
                    setActiveAction("");
                });
            }, 1000);
        }

        const handleTent = async (event: mapboxgl.MapMouseEvent) => {
            console.log('handleTent');
            const coords = event.lngLat;
            const geojson = await getGeoJson(coords.lat, coords.lng);
            if (map.current!.getSource('campground')) {
                (map.current!.getSource('campground') as GeoJSONSource).setData(geojson);
            } else {
                map.current!.loadImage(tentIcon.src, async (error, image) => {
                    if (error) throw error;
 
                    map.current!.addImage('campground', image!);

                    map.current!.addSource('campground', {
                        type: 'geojson',
                        data: geojson
                    });
    
                    map.current!.addLayer({
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
                            (map.current!.getSource('campground') as GeoJSONSource).setData(geojson);                            
                        } else {
                            map.current!.removeLayer('tent');
                            map.current!.removeSource('campground');
                        }
                    }
                    setActiveAction("");
                });
            }, 1000);
        }

        const handlePinpoint = async (event: mapboxgl.MapMouseEvent) => {
            console.log('handlePinpoint');
            const markerArray = await getMarkersInSession(activeSession);

            const marker = new mapboxgl.Marker();
            const coords = event.lngLat;
            marker.setLngLat(coords).addTo(map.current!);

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
            <div ref={mapContainer} className={styles.map} />
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

export default SessionMap;