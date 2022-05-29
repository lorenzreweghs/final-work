/* eslint-disable @next/next/no-img-element */
import { FormEvent, useState } from 'react';

import useSession from '../../hooks/useSession';
import teamIcon from '../../../public/team_icon_color.png';
import { SessionSteps } from '../../../pages/session';

import styles from './Team.module.css';

interface TeamProps {
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
    activeSession: string,
}

export const Team = ({ setActiveStep, activeSession }: TeamProps) => {
    const { addTeamName } = useSession();
    const [teamName, setTeamName] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await addTeamName(teamName, activeSession);
        setActiveStep(SessionSteps.Share);
    }

    return (
        <div className={styles.container}>
            <img className={styles.teamIcon} src={teamIcon.src} alt='team icon' width='100%' height='auto' />
            <h1 className={styles.title}>Kies een teamnaam</h1>
            <p className={styles.subTitle}>Deze is zichtbaar voor andere teams</p>

            <form className={styles.teamForm} onSubmit={handleSubmit}>
                <input type='text' className={styles.teamInput} placeholder='Teamnaam' minLength={3} maxLength={12} onChange={(e) => setTeamName(e.target.value)} required />
                <input type='submit' className={styles.teamSubmit} value='Bevestigen' />
            </form>
        </div>
    );
}