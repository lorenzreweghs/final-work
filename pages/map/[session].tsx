import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import mapboxgl, { GeoJSONSource, Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { ref, onValue, get } from "firebase/database";
import Swal from 'sweetalert2';
import { Error } from '@mui/icons-material';
import { StaticImageData } from 'next/image';

import useLocation, { db } from '../../src/hooks/useLocation';
import useSession, { MarkerTypes } from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';

import flagIcon from '../../public/flag_icon_color.png';
import tentIcon from '../../public/campground_icon.png';

import colaLogo from '../../public/sponsors/cola-logo.png';
import jupilerLogo from '../../public/sponsors/jupiler-logo.png';
import kbcLogo from '../../public/sponsors/kbc-logo.png';
import redbullLogo from '../../public/sponsors/redbull-logo.png';
import stubruLogo from '../../public/sponsors/studiobrussel-logo.png';
import twitchLogo from '../../public/sponsors/twitch-logo.png';
import winforlifeLogo from '../../public/sponsors/winforlife-logo.png';

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

    const [activeAction, setActiveAction] = useState<string | null>(null);

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
                    addSourceWithImage(flagIcon, 'flag', {lng: coords.lng, lat: coords.lat}, 0.25, 0);
                }
            }
            setCurrentFlag();

            const setCurrentTent = async () => {
                const [coords] = await getMarkersInSession(activeSession, MarkerTypes.tent);
                if (coords) {
                    addSourceWithImage(tentIcon, 'tent', {lng: coords.lng, lat: coords.lat}, 0.9, 0);
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

            const sponsorMarkers = [
                {
                    lng: 4.681973,
                    lat: 50.968945,
                    logo: kbcLogo,
                    id: 'kbc',
                },
                {
                    lng: 4.682827,
                    lat: 50.969121,
                    logo: winforlifeLogo,
                    id: 'winforlife',
                    size: 0.425,
                },
                {
                    lng: 4.683993,
                    lat: 50.969449,
                    logo: colaLogo,
                    id: 'cola',
                },
                {
                    lng: 4.684338,
                    lat: 50.968868,
                    logo: twitchLogo,
                    id: 'twitch',
                },
                {
                    lng: 4.684847,
                    lat: 50.966581,
                    logo: jupilerLogo,
                    id: 'jupiler',
                    size: 0.275,
                },
                {
                    lng: 4.682306,
                    lat: 50.967280,
                    logo: stubruLogo,
                    id: 'stubru',
                    size: 0.28,
                },
                {
                    lng: 4.682665,
                    lat: 50.966823,
                    logo: redbullLogo,
                    id: 'redbull',
                    size: 0.4,
                },
            ];
    
            sponsorMarkers.forEach((sponsor) => {
                addSourceWithImage(sponsor.logo, sponsor.id, {lng: sponsor.lng, lat: sponsor.lat}, sponsor.size ?? 0.25);
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
            (map.current!.getSource('flag-source') as GeoJSONSource).setData(geojson);

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
                        (map.current!.getSource('flag-source') as GeoJSONSource).setData(geojson);
                    }
                    setActiveAction(null);
                });
            }, 1000);
        }

        const handleTent = async (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            const geojson = await getGeoJson(coords.lat, coords.lng);
            if (map.current!.getSource('tent-source')) {
                (map.current!.getSource('tent-source') as GeoJSONSource).setData(geojson);
            } else {
                addSourceWithImage(tentIcon, 'tent', {lng: coords.lng, lat: coords.lat}, 0.9, 0);
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
                            (map.current!.getSource('tent-source') as GeoJSONSource).setData(geojson);                            
                        } else {
                            map.current!.removeLayer('tent-layer');
                            map.current!.removeSource('tent-source');
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

    const addSourceWithImage = (icon: StaticImageData, id: string, coords: {lng: number, lat: number}, size: number = 1, minzoom: number = 14) => {
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
        </div>
    );
}

export const getServerSideProps = withPageAuthRequired();

export default SessionMap;