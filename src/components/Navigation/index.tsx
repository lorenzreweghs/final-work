/* eslint-disable @next/next/no-img-element */
import { useUser } from '@auth0/nextjs-auth0';
import { MapOutlined, GroupsOutlined, ShareOutlined, LogoutOutlined } from '@mui/icons-material';
import classNames from 'classnames';

import logo from '../../../public/rock-werchter-2022.png';

import { Action, ActionTypes } from '../Action';
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
                    <MapOutlined sx={{ fontSize: 44 }} />
                    <p>KAART</p>
                </div>
                <div className={styles.teams}>
                    <GroupsOutlined sx={{ fontSize: 44 }} />
                    <p>TEAMS</p>
                </div>
                <div className={styles.invite}>
                    <ShareOutlined sx={{ fontSize: 44 }} />
                    <p>UITNODIGEN</p>
                </div>

                <img className={styles.logo} src={logo.src} alt='rock werchter 2022 logo' width='100%' height='auto' />

                <div className={styles.logout}>
                    <LogoutOutlined sx={{ fontSize: 44 }} />
                    <p>LOGOUT</p>
                </div>

                <div className={styles.close} onClick={() => setIsOpen(false)}>
                    <Action type={ActionTypes.close} />
                </div>
            </nav>
        </div>
    );
}
