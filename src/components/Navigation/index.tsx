/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import { useUser } from '@auth0/nextjs-auth0';
import { MapOutlined, GroupsOutlined, ShareOutlined, LogoutOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import Link from 'next/link';

import logo from '../../../public/rock-werchter-2022.png';
import { ActivityProgress } from '../ActivityProgress';

import styles from './Navigation.module.css';

interface NavigationProps {
    activeSession: string | string[] | undefined,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
}

export const Navigation = ({ activeSession, setIsOpen, isOpen }: NavigationProps) => {
    const { user } = useUser();

    return (
        <div className={classNames(styles.container, { [styles.open]: isOpen })}>
            <div className={styles.user}>
                <img className={styles.profilePic} src={user?.picture!} alt='profile picture' width='100%' height='auto' referrerPolicy="no-referrer" />
                <p className={styles.name}>{user?.name}</p>
            </div>

            <div className={styles.progress}>
                <div className={styles.scrollDiv}>
                    <div className={styles.activityDiv}>
                        <ActivityProgress activeSession={activeSession} />
                    </div>                    
                </div>
            </div>

            <div className={styles.code}>
                <p className={styles.codeText}>Deel deze code: <span>{activeSession}</span></p>
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

                <img className={styles.logo} src={logo.src} alt='rock werchter 2022 logo' width='100%' height='auto' />

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
