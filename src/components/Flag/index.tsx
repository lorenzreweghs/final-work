/* eslint-disable @next/next/no-img-element */
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Swal from 'sweetalert2';

import useLocation from '../../hooks/useLocation';
import flagIcon from '../../../public/flag_icon_color.png';

import styles from './Flag.module.css';
import { SessionSteps } from '../../../pages/session';

interface FlagProps {
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
    activeSession: string,
}

export const Flag = ({ setActiveStep, activeSession }: FlagProps) => {
    const { addMarker } = useLocation();

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
        });

        map.on('click', (event) => {
            updateFlag(event);
        });

        const updateFlag = (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            map.loadImage(flagIcon.src, async (error, image) => {
                if (error) throw error;

                map.addImage('flag', image!);

                map.addSource('flag', {
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
                        map.removeLayer('gather');
                        map.removeSource('flag');
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

            <div id='map' className={styles.map} />
        </div>
    );
}