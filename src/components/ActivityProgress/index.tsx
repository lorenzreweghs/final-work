/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { Timestamp } from "firebase/firestore";
import { StaticImageData } from 'next/image';
import classNames from 'classnames';

import useProgress, { ActivityType } from '../../hooks/useProgress';
import { sponsors, SponsorType } from '../../../config/sponsors';
import winnerIcon from '../../../public/badges/winner_icon.png';

import styles from './ActivityProgress.module.css';

interface ActivityProps {
    activeSession: string | string[] | undefined,
}

export const ActivityProgress = ({ activeSession }: ActivityProps) => {
    const { getProgress } = useProgress();

    const [activities, setActivities] = useState<Array<ActivityType>>([]);
    const [images, setImages] = useState<Array<StaticImageData> | null>(null);
    const [allCompleted, setAllCompleted] = useState(true);

    useEffect(() => {
        if(!activeSession) return;

        const getActivities = async () => {
            setActivities(await getProgress(activeSession));
        }
        getActivities();
    }, [activeSession]);

    useEffect(() => {
        let imageArray: Array<StaticImageData> = [];
        activities.forEach((activity: ActivityType) => {
            sponsors.forEach((sponsor: SponsorType) => {
                if (sponsor.id === activity.sponsor) {
                    imageArray.push(sponsor.logo);
                }
            });
            if (!activity.isCompleted) setAllCompleted(false);
        });
        setImages(imageArray);
    }, [activities]);

    return (
        <div className={styles.container}>
            {
                images?.length ? (
                    activities.map((activity, index) => 
                        <img key={images![index].src} className={classNames(styles.logo, styles[activity.sponsor], { [styles.notCompleted]: !activity.isCompleted })} src={images![index].src} alt='sponsor logo' width='100%' height='auto' /> 
                    )) : null
            }
            <img className={classNames(styles.winnerIcon, { [styles.notCompleted]: !allCompleted })} src={winnerIcon.src} alt='winner icon' width='100%' height='auto' /> 
        </div>
    );
}
