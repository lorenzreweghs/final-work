/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import useSession from '../../hooks/useSession';
import useOtherUser from '../../hooks/useOtherUser';
import teamIcon from '../../../public/team_icon_color.png';
import { SessionSteps } from '../../../pages/session';

import styles from './Team.module.css';

interface TeamProps {
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
    activeSession: string,
}

export const Team = ({ setActiveStep, activeSession }: TeamProps) => {
    const { addTeamName } = useSession();
    const { getTeams } = useOtherUser();
    const [teamName, setTeamName] = useState("");
    const [teams, setTeams] = useState<Array<{name: string, session: string, people: number}>>([]);

    useEffect(() => {
        const getTeamsArray = async () => {
            const teamsArray = await getTeams();
            setTeams(teamsArray);
        }
        getTeamsArray();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        let teamNameExists = false;
        teams.forEach((team) => {
            if (team.name.toLowerCase() === teamName.toLowerCase()) teamNameExists = true;
        });

        if (!teamNameExists) {
            await addTeamName(teamName, activeSession, [...teams, { name: teamName, session: activeSession, people: 1 }]);
            setActiveStep(SessionSteps.Share);
            return;
        }

        Swal.fire({
            title: 'Teamnaam bestaat al',
            icon: 'warning',
            timer: 2500,
            timerProgressBar: true,
        })
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