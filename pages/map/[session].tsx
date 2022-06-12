import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import mapboxgl, { GeoJSONSource, Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { ref, onValue, get } from "firebase/database";
import Swal from 'sweetalert2';
import { Error, OpenInNew } from '@mui/icons-material';

import useLocation, { db } from '../../src/hooks/useLocation';
import useSession, { MarkerTypes } from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';
import { sponsors, SponsorType } from '../../config/sponsors';
import { addSourceWithImage, getGeoJson } from '../../src/helpers/helpers';
import { ActivityProgress } from '../../src/components/ActivityProgress';
import { ProgressInfo } from '../../src/components/ProgressInfo';
import { Information } from '../../src/components/Information';

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
    
    const [navIsOpen, setNavIsOpen] = useState(false);
    const [progressIsOpen, setProgressIsOpen] = useState(false);
    const [infoIsOpen, setInfoIsOpen] = useState(false);

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const userList = useRef<Array<{id: string, name: string}>>([]);
    const layerArray = useRef<string[]>([]);

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        if (window && window.innerWidth > 600) router.push('/desktop');
        
        const { session } = router.query;
        setActiveSession(session);
        
        const checkSession = async () => {
            userList.current = await getUsersInSession(session);
            let containsUser = false;
            userList.current.forEach((element) => {
                if (element.id === user?.sub!) containsUser = true;
            });
            if (!containsUser) router.push('/');
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
            zoom: zoom,
            logoPosition: 'top-right',
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
            Swal.close();

            geolocate.trigger();
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

                    if (map.current!.getLayer(userId)) {
                        map.current!.removeLayer(userId);
                    }
            
                    if (map.current!.getSource(userName)) {
                        map.current!.removeSource(userName);
                    }

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
                    layerArray.current.push(userId);
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
                if (users && users.length) {
                    const lastUser = users.pop();
                    checkStatus(lastUser.id);
                }
            });

            userList.current.forEach(async (user) => {
                checkStatus(user.id);
            });

            const setCurrentFlag = async () => {
                const [coords] = await getMarkersInSession(activeSession, MarkerTypes.flag);
                if (coords) {
                    addSourceWithImage(map, flagIcon, 'flag', {lng: coords.lng, lat: coords.lat}, layerArray.current, 0.25, 0);
                }
            }
            setCurrentFlag();

            const setCurrentTent = async () => {
                const [coords] = await getMarkersInSession(activeSession, MarkerTypes.tent);
                if (coords) {
                    addSourceWithImage(map, tentIcon, 'tent', {lng: coords.lng, lat: coords.lat}, layerArray.current, 0.9, 0);
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
    
            sponsors.forEach((sponsor: SponsorType) => {
                addSourceWithImage(map, sponsor.logo, sponsor.id, {lng: sponsor.lng, lat: sponsor.lat}, layerArray.current, sponsor.size ?? 0.25);
            });
        });

        navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, { enableHighAccuracy: true });
    }, [activeSession]);

    useEffect(() => {
        if (!activeSession || !map.current) return;

        let action = activeAction;

        const handleClick = (event: mapboxgl.MapMouseEvent) => {
            switch (action) {
                case "gather":
                    handleGather(event);
                    action = '';
                    break;
                case "tent":
                    handleTent(event);
                    action = '';
                    break;
                case "pinpoint":
                    handlePinpoint(event);
                    action = '';
                    break;
            }
        }
    
        map.current!.on('click', handleClick);

        const handleGather = async (event: mapboxgl.MapMouseEvent) => {
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
                    setActiveAction(null);
                });
            }, 1000);
        }

        const handleTent = async (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            const geojson = await getGeoJson(coords.lat, coords.lng);
            if (map.current!.getSource('tent')) {
                (map.current!.getSource('tent') as GeoJSONSource).setData(geojson);
            } else {
                addSourceWithImage(map, tentIcon, 'tent', {lng: coords.lng, lat: coords.lat}, layerArray.current, 0.9, 0);
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
                            (map.current!.getSource('tent') as GeoJSONSource).setData(geojson);                            
                        } else {
                            map.current!.removeLayer('tent-layer');
                            map.current!.removeSource('tent');
                        }
                    }
                    setActiveAction(null);
                });
            }, 1000);
        }

        const handlePinpoint = async (event: mapboxgl.MapMouseEvent) => {
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
                    setActiveAction(null);
                });
            }, 1000);
        }

        return () => {
            map.current!.off('click', handleClick);
        }
    }, [activeAction, activeSession]);

    useEffect(() => {
        if (!map.current) return;

        const handlePopup = (e: any) => {
            const features = map.current?.queryRenderedFeatures(e.point, {
                layers: [...layerArray.current],
            });
            if (!features?.length) {
                return;
            }
            const feature = features[0];

            let htmlString = '';
            switch (feature.source) {
                case 'kbc':
                    htmlString = `
                        <h3>Raden</h3>
                        <p>KBC</p>
                    `;
                    break;
                case 'win for life':
                    htmlString = `
                        <h3>Uitbeelden</h3>
                        <p>Win for Life</p>
                    `;
                    break;
                case 'coca cola':
                    htmlString = `
                        <h3>Selfie</h3>
                        <p>Coca Cola</p>
                    `;
                    break;
                case 'twitch':
                    htmlString = `
                        <h3>Muziekgenres</h3>
                        <p>Twitch</p>
                    `;
                    break;
                case 'jupiler':
                    htmlString = `
                        <h3>Snelheid</h3>
                        <p>Jupiler</p>
                    `;
                    break;
                case 'studio brussel':
                    htmlString = `
                        <h3>Quiz</h3>
                        <p>Studio Brussel</p>
                    `;
                    break;
                case 'red bull':
                    htmlString = `
                        <h3>Behendigheid</h3>
                        <p>Red Bull</p>
                    `;
                    break;
                case 'flag':
                    htmlString = `
                        <h3>Verzamelpunt</h3>
                    `;
                    break;
                case 'tent':
                    htmlString = `
                        <h3>Tentlocatie</h3>
                    `;
                    break;
                default:
                    htmlString = `<h3>${feature.source}</h3>`;
            }

            const popup = new mapboxgl.Popup({ 
                className: styles.popup,
                offset: [0, -22],
                closeButton: false,
                closeOnClick: true,
                closeOnMove: true,
            })
                .setLngLat((feature.geometry as any).coordinates)
                .setHTML(htmlString)
                .addTo(map.current!);
        }

        map.current.on('click', handlePopup);

        return () => {
            map.current!.off('click', handlePopup);
        }
    }, []);

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
            <Head>
                <title>Map - {activeSession}</title>
                <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div ref={mapContainer} className={styles.map} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} />
            </div>
            {activeAction && <Notification />}
            <div className={styles.actions}>
                <div onClick={() => {
                    if (activeAction === 'gather') setActiveAction(null);
                    else setActiveAction('gather');
                }}>
                    <Action type={ActionTypes.gather} isActive={activeAction === 'gather'} />
                </div>
                <div onClick={() => {
                    if (activeAction === 'tent') setActiveAction(null);
                    else setActiveAction('tent');
                }}>
                    <Action type={ActionTypes.tent} isActive={activeAction === 'tent'} />
                </div>
                <div onClick={() => {
                    if (activeAction === 'pinpoint') setActiveAction(null);
                    else setActiveAction('pinpoint');
                }}>
                    <Action type={ActionTypes.pinpoint} isActive={activeAction === 'pinpoint'} />
                </div>
            </div>

            <div className={styles.info} onClick={() => setInfoIsOpen(true)}>
                <Action type={ActionTypes.info} />
            </div>

            <div className={styles.progressDiv} onClick={() => setProgressIsOpen(true)}>
                <div className={styles.progressHeader}>
                    <p className={styles.progressTitle}>Activiteiten</p>
                    <OpenInNew fontSize='small' />
                </div>
                <ActivityProgress activeSession={activeSession} />
            </div>
            <ProgressInfo activeSession={activeSession} setIsOpen={setProgressIsOpen} isOpen={progressIsOpen} />
            <Information setIsOpen={setInfoIsOpen} isOpen={infoIsOpen} />
        </div>
    );
}

export const getServerSideProps = withPageAuthRequired();

export default SessionMap;
