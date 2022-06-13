/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import supportIcon from '../../../public/support_icon_color.png';
import { Button, ButtonTypes } from '../Button';

import styles from './Share.module.css';

interface ShareProps {
    activeSession: string,
}

export const Share = ({ activeSession }: ShareProps) => {
    const [teamsLoadingSpinner, setTeamsLoadingSpinner] = useState(false);
    const [mapLoadingSpinner, setMapLoadingSpinner] = useState(false);

    return (
        <div className={styles.container}>
            <img className={styles.supportIcon} src={supportIcon.src} alt='support icon' width='100%' height='auto' />
            <h1 className={styles.title}>Proficiat met je nieuw team</h1>
            <p className={styles.subTitle}>Ben je klaar om de uitdaging aan te gaan?</p>

            <p className={styles.codeText}>Deel deze <span>unieke code</span> met je vrienden (max <span>5 personen</span> per team): <span className={styles.activeSession}>{activeSession}</span></p>
        
            <div className={styles.teamsButton} onClick={() => setTeamsLoadingSpinner(true)}>
                <Button href={`/teams/${activeSession}`} text='Teams uitdagen' type={ButtonTypes.teams} loadingSpinner={teamsLoadingSpinner} loadingText='Teams inladen' />
            </div>

            <div className={styles.mapButton} onClick={() => setMapLoadingSpinner(true)}>
                <Button href={`/map/${activeSession}`} text='Verdergaan' type={ButtonTypes.map} loadingSpinner={mapLoadingSpinner} loadingText='Map inladen' />
            </div>
        </div>
    );
}