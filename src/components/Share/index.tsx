/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import supportIcon from '../../../public/support_icon_color.png';
import { Button } from '../Button';

import styles from './Share.module.css';

interface ShareProps {
    activeSession: string,
}

export const Share = ({ activeSession }: ShareProps) => {
    const [loadingSpinner, setLoadingSpinner] = useState(false);

    return (
        <div className={styles.container}>
            <img className={styles.supportIcon} src={supportIcon.src} alt='support icon' width='100%' height='auto' />
            <h1 className={styles.title}>Proficiat met je nieuw team</h1>
            <p className={styles.subTitle}>Ben je klaar om de uitdaging aan te gaan?</p>

            <p className={styles.codeText}>Deel deze <span>unieke code</span> met je vrienden (max <span>5 personen</span> per team): <span className={styles.activeSession}>{activeSession}</span></p>
        
            <div className={styles.button} onClick={() => setLoadingSpinner(true)}>
                <Button href={`/map/${activeSession}`} text='Verdergaan' loadingSpinner={loadingSpinner} loadingText='Map inladen' />
            </div>
        </div>
    );
}