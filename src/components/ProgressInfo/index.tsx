/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { StaticImageData } from 'next/image';
import classNames from 'classnames';

import useProgress, { ActivityType } from '../../hooks/useProgress';
import { sponsors, SponsorType } from '../../../config/sponsors';
import { badges } from '../../../config/badges';
import { Action, ActionTypes } from '../Action';

import styles from './ProgressInfo.module.css';

interface ProgressProps {
    activeSession: string | string[] | undefined,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
}

export const ProgressInfo = ({ activeSession, setIsOpen, isOpen }: ProgressProps) => {
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
        <div className={classNames(styles.container, { [styles.open]: isOpen })}>
            <div className={styles.banner} />

            <h1 className={styles.title}>Verdien<br /><span>prijzen</span><br />van onze sponsors</h1>
            <p className={styles.subTitle}>bij elke gewonnen activiteit</p>

            {
                images?.length ? (
                    activities.map((activity, index) => 
                        <div key={activity.sponsor} className={classNames(styles.sponsorDiv, { [styles.notCompleted]: !activity.isCompleted })}>
                            <img key={images![index].src} className={classNames(styles.sponsorLogo, styles[activity.sponsor])} src={images![index].src} alt='sponsor logo' width='100%' height='auto' />
                            <div className={styles.sponsorInfo}>
                                <p>{activity.sponsor}</p>
                                <p>Prijs: <span className={styles.price}>{activity.isCompleted ? activity.price : 'Onbekend'}</span></p>
                            </div>
                            <img key={badges[index].src} className={styles.badge} src={badges![index].src} alt='badge icon' width='100%' height='auto' />
                        </div>
                    )) : null
            }

            <div className={classNames(styles.voucher, { [styles.notCompleted]: !allCompleted })}>
                <p><span>Voucher</span> ter waarde van xxx</p>
                <img key={badges[7].src} className={styles.badge} src={badges![7].src} alt='badge icon' width='100%' height='auto' />
            </div>
            
            <div className={classNames(styles.close, { [styles.showClose]: isOpen })} onClick={() => setIsOpen(false)}>
                <Action type={ActionTypes.close} isActive />
            </div>
        </div>
    );
}
