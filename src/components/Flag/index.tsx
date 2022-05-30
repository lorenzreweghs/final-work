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

        const marker = new mapboxgl.Marker();

        map.on('click', (event) => {
            updateMarker(event);
        });

        const updateMarker = (event: mapboxgl.MapMouseEvent) => {
            const coords = event.lngLat;
            marker.setLngLat(coords).addTo(map);

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
                        marker.remove();
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