/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Swal from 'sweetalert2';

import useLocation from '../../hooks/useLocation';
import flagIcon from '../../../public/flag_icon_color.png';

import styles from './Flag.module.css';
import { SessionSteps } from '../../../pages/session';
import { sponsors, SponsorType } from '../../../config/sponsors';
import { addSourceWithImage } from '../../helpers/helpers';

interface FlagProps {
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
    activeSession: string,
}

export const Flag = ({ setActiveStep, activeSession }: FlagProps) => {
    const { addMarker } = useLocation();

    const mapContainer = useRef(null);
    const map = useRef<Map | null>(null);
    const [lng, setLng] = useState(4.68111496672563);
    const [lat, setLat] = useState(50.9683219343008);
    const [zoom, setZoom] = useState(15);

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

            sponsors.forEach((sponsor: SponsorType) => {
                addSourceWithImage(map, sponsor.logo, sponsor.id, {lng: sponsor.lng, lat: sponsor.lat}, [], sponsor.size ?? 0.25);
            });
        });
    });

    useEffect(() => {
        if (!activeSession) return;

        map.current!.on('click', (event) => {
            updateFlag(event);
        });

        const updateFlag = (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            map.current!.loadImage(flagIcon.src, async (error, image) => {
                if (error) throw error;

                if (!map.current!.hasImage('flag-image')) {
                    map.current!.addImage('flag-image', image!);
                }

                if (map.current!.getLayer('flag-layer')) {
                    map.current!.removeLayer('flag-layer');
                }

                if (map.current!.getSource('flag-source')) {
                    map.current!.removeSource('flag-source');
                }
                
                map.current!.addSource('flag-source', {
                    type: 'geojson',
                    data: {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                "properties": {},
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': [coords.lng, coords.lat],
                                }
                            }
                        ]
                    }
                });
    
                map.current!.addLayer({
                    'id': 'flag-layer',
                    'type': 'symbol',
                    'source': 'flag-source',
                    'layout': {
                        'icon-image': 'flag-image',
                        'icon-size': 0.25,
                    }
                });
            });

            setTimeout(() => {
                Swal.fire({
                    title: 'Vlag bevestigen',
                    text: "Zeker dat je hier je eerste verzamelpunt wilt plaatsen?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: 'var(--color-primary-light)',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Vlag plaatsen',
                    cancelButtonText: 'Annuleren'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await addMarker(activeSession, [{lng: coords.lng, lat: coords.lat}], true);
                        setActiveStep(SessionSteps.Team);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        map.current!.removeLayer('flag-layer');
                        map.current!.removeSource('flag-source');
                    }
                });
            }, 1000);
        }
    }, [activeSession]);

    return (
        <div className={styles.container}>
            <img className={styles.flagIcon} src={flagIcon.src} alt='flag icon' width='100%' height='auto' />
            <h1 className={styles.title}>Plaats een vlaggenmast</h1>
            <p className={styles.subTitle}>Dit wordt jullie eerste verzamelpunt</p>

            <div ref={mapContainer} className={styles.map} />
        </div>
    );
}