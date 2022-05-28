/* eslint-disable @next/next/no-img-element */
import { useUser } from '@auth0/nextjs-auth0';
import { MapOutlined, GroupsOutlined, ShareOutlined, LogoutOutlined } from '@mui/icons-material';

import logo from '../../../public/rock-werchter-2022.png';

import styles from './Navigation.module.css';

interface NavigationProps {
    activeSession: string | string[] | undefined,
}

export const Navigation = ({ activeSession }: NavigationProps) => {
    const { user } = useUser();

    return (
        <div className={styles.container}>
            <div className={styles.user}>
                <img className={styles.profilePic} src={user?.picture!} alt='profile picture' width='100%' height='auto' />
                <p className={styles.name}>{user?.name}</p>
            </div>

            <div className={styles.progress}>
                
            </div>

            <div className={styles.code}>
                <p className={styles.codeText}>Deel deze code: <span>{activeSession}</span></p>
            </div>

            <nav className={styles.navigation}>
                <div className={styles.map}>
                    <MapOutlined />
                    <p>KAART</p>
                </div>
                <div className={styles.teams}>
                    <GroupsOutlined />
                    <p>TEAMS</p>
                </div>
                <div className={styles.invite}>
                    <ShareOutlined />
                    <p>UITNODIGEN</p>
                </div>

                <img className={styles.logo} src={logo.src} alt='rock werchter 2022 logo' width='100%' height='auto' />

                <div className={styles.logout}>
                    <LogoutOutlined />
                    <p>LOGOUT</p>
                </div>
            </nav>
        </div>
    );
}
