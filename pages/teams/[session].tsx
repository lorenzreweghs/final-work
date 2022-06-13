/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import classNames from 'classnames';
import { generate } from 'generate-password';
import { SvgIconProps } from '@mui/material';
import { Person, Piano, SportsBasketball, SportsSoccer, SportsEsports, SportsBar, Agriculture, Help } from '@mui/icons-material';

import useSession from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';
import { Search } from '../../src/components/Search';

import styles from '../../styles/Teams.module.css';

const Teams = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { getUsersInSession } = useSession();
    const { getTeams, getIcon, getColor } = useOtherUser();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
    const [navIsOpen, setNavIsOpen] = useState(false);
    const [switchPage, setSwitchPage] = useState(false);

    const userList = useRef<Array<{id: string, name: string}>>([]);
    const iconArray = useRef<React.ReactElement<SvgIconProps>[]>([]);
    const [userArray, setUserArray] = useState<Array<{id: string | null, name: string}>>([]);
    const [teams, setTeams] = useState<Array<{name: string, session: string, people: number}>>([]);
    const [filteredTeams, setFilteredTeams] = useState<Array<{name: string, session: string, people: number}>>([]);

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        if (window && window.innerWidth > 600) router.push('/desktop');

        const { session } = router.query;
        setActiveSession(session);

        const getTeamsArray = async () => {
            const teamsArray = await getTeams();
            setTeams(teamsArray);
            setFilteredTeams(teamsArray);
        }
        getTeamsArray();
        
        const checkSession = async () => {
            userList.current = await getUsersInSession(session);
            let containsUser = false;
            userList.current.forEach((element) => {
              if (element.id === user?.sub!) containsUser = true;
            });
            if (!containsUser) router.push('/');
        }
        checkSession()
        .then(() => {
            const localUserArray: Array<{id: string | null, name: string}> = [];

            userList.current.forEach(async (user) => {
                localUserArray.push({id: user.id, name: user.name});

                const icon = await getIcon(user.id!);
                const color = await getColor(user.id!);
    
                switch (icon) {
                    case 'basketball':
                        iconArray.current.push(<SportsBasketball fontSize='large' sx={{ color }} />);
                        break;
                    case 'soccer':
                        iconArray.current.push(<SportsSoccer fontSize='large' sx={{ color }} />);
                        break;
                    case 'gaming':
                        iconArray.current.push(<SportsEsports fontSize='large' sx={{ color }} />);
                        break;
                    case 'piano':
                        iconArray.current.push(<Piano fontSize='large' sx={{ color }} />);
                        break;
                    case 'tractor':
                        iconArray.current.push(<Agriculture fontSize='large' sx={{ color }} />);
                        break;
                    default:
                        iconArray.current.push(<SportsBar fontSize='large' sx={{ color }} />);
                }
            });

            for (let index = 0; index < 5 - userList.current.length; index++) {
                const randomId = generate({
                    length: 6,
                    numbers: true,
                    uppercase: false,
                    lowercase: false,
                });
                localUserArray.push({id: randomId, name: 'Resterende plek'});
            }

            setUserArray(localUserArray);
        });
    }, [router.isReady, isLoading, getColor, getIcon]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        const teamMatches = teams.filter(team => team.name.includes(searchValue));
        setFilteredTeams(teamMatches);
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Teams - {activeSession}</title>
                <meta name="description" content="Een festivalbeleving zoals nooit tevoren" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.banner} />
            <nav className={styles.topNav}>
                <p className={classNames({ [styles.activeTeams]: !switchPage })} onClick={() => setSwitchPage(false)}>Teams</p>
                <p className={classNames({ [styles.activeChallenged]: switchPage })} onClick={() => setSwitchPage(true)}>Uitgedaagd</p>
            </nav>
            
            {
                switchPage ? 
                    null :
                    <div>
                        <div className={styles.ownTeam}>
                            <div className={styles.titleDiv}>
                                <h1>Eigen <span>teamleden</span></h1>
                                <p><i>(maximaal 5 personen)</i></p>
                            </div>
                            <ul className={styles.ownTeamList}>
                                {userArray.map((user, index) =>
                                    <li key={user.id} className={classNames({ [styles.empty]: user.name === 'Resterende plek' })}>
                                        {user.name === 'Resterende plek' ? <Help /> : iconArray.current[index]}
                                        <p>{user.name}</p>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className={styles.otherTeams}>
                            <h1>Andere <span>teams</span></h1>
                            <div className={styles.search}>
                                <Search handleChange={handleChange} />
                            </div>
                            <div className={styles.otherTeamsList}>
                                {filteredTeams.map((team) => 
                                    <div key={team.name} className={styles.team}>
                                        <p>{team.name}</p>
                                        <div className={styles.people}>
                                            <Person />
                                            {team.people}
                                        </div>
                                        <button>Uitdagen</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            }

            <Navigation activeSession={activeSession} setIsOpen={setNavIsOpen} isOpen={navIsOpen} />
            <div className={styles.menu} onClick={() => setNavIsOpen(true)}>
                <Action type={ActionTypes.menu} isActive />
            </div>
        </div>
    );
}

export const getServerSideProps = withPageAuthRequired();

export default Teams;
