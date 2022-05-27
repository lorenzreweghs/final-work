/* eslint-disable @next/next/no-img-element */
import supportIcon from '../../../public/support_icon.png';
import { Button } from '../Button';

import styles from './Share.module.css';

interface ShareProps {
    activeSession: string,
}

export const Share = ({ activeSession }: ShareProps) => {
    return (
        <div className={styles.container}>
            <img className={styles.supportIcon} src={supportIcon.src} alt='support icon' width='100%' height='auto' />
            <h1 className={styles.title}>Proficiat</h1>
            <p className={styles.subTitle}>Ben je klaar om de uitdaging aan te gaan?</p>

            <p className={styles.codeText}>Deel deze <span>unieke code</span> met je vrienden (max <span>5 personen</span> per team): <span className={styles.activeSession}>{activeSession}</span></p>
        
            <div className={styles.button}>
                <Button href={`/map/${activeSession}`} text='Verdergaan' />
            </div>
        </div>
    );
}