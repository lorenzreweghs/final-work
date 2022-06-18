/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import { MapOutlined, GroupsOutlined, ShareOutlined, ExitToApp, LogoutOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import Link from 'next/link';

import logo from '../../../public/rock-werchter-2022.png';
import { ActivityProgress } from '../ActivityProgress';
import { ProgressBar } from '../ProgressBar';
import useSession from '../../hooks/useSession';
import useOtherUser from '../../hooks/useOtherUser';

import styles from './Navigation.module.css';
import { ProgressInfo } from '../ProgressInfo';

interface NavigationProps {
    activeSession: string | string[] | undefined,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
}

export const Navigation = ({ activeSession, setIsOpen, isOpen }: NavigationProps) => {
    const { user } = useUser();
    const router = useRouter();
    const { getUsersInSession, updateSession, removeSessionFromUser } = useSession();
    const { getTeams, getColor } = useOtherUser();

    const [progressIsOpen, setProgressIsOpen] = useState(false);

    const handleLeave = async () => {
        const users = await getUsersInSession(activeSession);

        users.forEach((element, index) => {
            if (element.id.includes(user?.sub!)) {
                users.splice(index, 1);
            }
        });

        let teams = await getTeams();
        teams.forEach((team) => {
          if (team.session === activeSession) team.people--;
        });

        const icon = localStorage.getItem('icon') ?? '';
        const color = await getColor(user?.sub!);

        await updateSession(user?.sub!, users, teams, user?.name!, icon, color, activeSession);
        await removeSessionFromUser(user?.sub!, user?.name!, icon, color);
        router.push('/session');
    }

    return (
        <div className={classNames(styles.container, { [styles.open]: isOpen })}>
            <div className={styles.user}>
                <img className={styles.profilePic} src={user?.picture!} alt='profile picture' width='100%' height='auto' referrerPolicy="no-referrer" />
                <p className={styles.name}>{user?.name}</p>
            </div>

            <div className={styles.progress} onClick={() => setProgressIsOpen(true)}>
                <div className={styles.scrollDiv}>
                    <div className={styles.activityDiv}>
                        <ActivityProgress activeSession={activeSession} />
                    </div>                    
                </div>
                <ProgressBar activeSession={activeSession} totalAmount={7} />
            </div>
            <ProgressInfo activeSession={activeSession} setIsOpen={setProgressIsOpen} isOpen={progressIsOpen} />

            <div className={styles.code}>
                <Link href={`/invite/${activeSession}`}>
                    <a>
                        <p className={styles.codeText}>Deel deze code: <span>{activeSession}</span></p>
                    </a>
                </Link>
            </div>

            <nav className={styles.navigation}>
                <div className={styles.map} onClick={() => setIsOpen(false)}>
                    <Link href={`/map/${activeSession}`}>
                        <a>
                            <MapOutlined sx={{ fontSize: 44 }} />
                            <p>KAART</p>
                        </a>                        
                    </Link>
                </div>
                <div className={styles.teams} onClick={() => setIsOpen(false)}>
                    <Link href={`/teams/${activeSession}`}>
                        <a>
                            <GroupsOutlined sx={{ fontSize: 44 }} />
                            <p>TEAMS</p>
                        </a>
                    </Link>
                </div>
                <div className={styles.invite} onClick={() => setIsOpen(false)}>
                    <Link href={`/invite/${activeSession}`}>
                        <a>
                            <ShareOutlined sx={{ fontSize: 44 }} />
                            <p>UITNODIGEN</p>
                        </a>
                    </Link>
                </div>

                <div className={styles.leave} onClick={handleLeave}>
                    <ExitToApp sx={{ fontSize: 44 }} />
                    <p>SESSIE VERLATEN</p>
                </div>

                <div className={styles.logout}>
                    <a href='/api/auth/logout'>
                        <LogoutOutlined sx={{ fontSize: 44 }} />
                        <p>LOGOUT</p>
                    </a>
                </div>

                <div className={classNames(styles.backdrop, { [styles.backdropOpen]: isOpen })} onClick={() => setIsOpen(false)} />
            </nav>
        </div>
    );
}
