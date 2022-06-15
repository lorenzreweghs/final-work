/* eslint-disable @next/next/no-img-element */
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import classNames from 'classnames';
import { generate } from 'generate-password';
import { SvgIconProps } from '@mui/material';
import { Person, Piano, SportsBasketball, SportsSoccer, SportsEsports, SportsBar, Agriculture, Help } from '@mui/icons-material';
import Swal from 'sweetalert2';

import useSession from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';
import useChallenge, { ChallengeType } from '../../src/hooks/useChallenge';
import { Navigation } from '../../src/components/Navigation';
import { Action, ActionTypes } from '../../src/components/Action';
import { Search } from '../../src/components/Search';
import { Modal } from '../../src/components/Modal';

import styles from '../../styles/Teams.module.css';

const Teams = () => {
    const { user, isLoading } = useUser();

    const router = useRouter();

    const { getUsersInSession } = useSession();
    const { getTeams, getIcon, getColor } = useOtherUser();
    const { getAllChallenges, updateChallenge } = useChallenge();

    const [activeSession, setActiveSession] = useState<string | string[] | undefined>('');
    const [navIsOpen, setNavIsOpen] = useState(false);
    const [switchPage, setSwitchPage] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const userList = useRef<Array<{id: string, name: string}>>([]);
    const [iconArray, setIconArray] = useState<React.ReactElement<SvgIconProps>[]>([]);
    const [userArray, setUserArray] = useState<Array<{id: string | null, name: string}>>([]);
    const [teams, setTeams] = useState<Array<{name: string, session: string, people: number}>>([]);
    const [filteredTeams, setFilteredTeams] = useState<Array<{name: string, session: string, people: number}>>([]);
    const [challengedTeam, setChallengedTeam] = useState<{name: string, session: string, people: number} | null>(null);
    const [teamName, setTeamName] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [activity, setActivity] = useState('');
    const [allChallenges, setAllChallenges] = useState<Array<ChallengeType>>([]);
    const [fromChallenges, setFromChallenges] = useState<Array<ChallengeType>>([]);
    const [toChallenges, setToChallenges] = useState<Array<ChallengeType>>([]);

    useEffect(() => {
        if (!router.isReady || isLoading) return;
        if (window && window.innerWidth > 600) router.push('/desktop');

        const { session } = router.query;
        setActiveSession(session);
        
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
            Swal.close();
        });
    }, [router.isReady, isLoading]);

    useEffect(() => {
        if (!activeSession) return;

        const getTeamsArray = async () => {
            const teamsArray = await getTeams();

            teamsArray.forEach((team, index) => {
                if (team.session === activeSession) {
                    setTeamName(team.name);
                    teamsArray.splice(index, 1);
                }
            });
            setTeams([...teamsArray].reverse());
            setFilteredTeams([...teamsArray].reverse());
        }
        getTeamsArray();
    }, [activeSession]);

    useEffect(() => {
        if (!teamName) return;

        const getChallengeArrays = async () => {
            const challengeArray = await getAllChallenges();
            let fromArray: Array<ChallengeType> = [];
            let toArray: Array<ChallengeType> = [];

            challengeArray.forEach((challenge) => {
                if (challenge.fromTeam === teamName) fromArray.push(challenge);
                if (challenge.toTeam === teamName) toArray.push(challenge);
            });
            setAllChallenges(challengeArray);
            setFromChallenges(fromArray);
            setToChallenges(toArray);
        }
        getChallengeArrays();
    }, [teamName]);

    useEffect(() => {
        if (isLoading) return;

        const setIcons = async () => {
            const icon = await getIcon(user?.sub!);
            const color = await getColor(user?.sub!);

            switch (icon) {
                case 'basketball':
                    setIconArray([...iconArray, <SportsBasketball key='basketball' fontSize='large' sx={{ color }} />]);
                    break;
                case 'soccer':
                    setIconArray([...iconArray, <SportsSoccer key='soccer' fontSize='large' sx={{ color }} />]);
                    break;
                case 'gaming':
                    setIconArray([...iconArray, <SportsEsports key='basketball' fontSize='large' sx={{ color }} />]);
                    break;
                case 'piano':
                    setIconArray([...iconArray, <Piano key='basketball' fontSize='large' sx={{ color }} />]);
                    break;
                case 'tractor':
                    setIconArray([...iconArray, <Agriculture key='basketball' fontSize='large' sx={{ color }} />]);
                    break;
                default:
                    setIconArray([...iconArray, <SportsBar key='basketball' fontSize='large' sx={{ color }} />]);
            }            
        }
        setIcons();
    }, [isLoading])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        const teamMatches = teams.filter(team => team.name.includes(searchValue));
        setFilteredTeams(teamMatches);
    }

    const handleChallenge = (team: {name: string, session: string, people: number}) => {
        setChallengedTeam(team);
        setModalIsOpen(true);
    }

    const handleChallengeSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!dateTime || !activity || !challengedTeam) return;

        const newChallenge = {
            fromTeam: teamName,
            toTeam: challengedTeam.name,
            dateTime,
            activity,
            isConfirmed: false,
        };

        await updateChallenge([...allChallenges, newChallenge]);
        setAllChallenges([...allChallenges, newChallenge]);
        setFromChallenges([...fromChallenges, newChallenge]);

        setModalIsOpen(false);
        setChallengedTeam(null);
        setSwitchPage(true);
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
                    <div>
                        <div className={styles.fromChallenges}>
                            <h1>Verstuurd</h1>
                            {fromChallenges.map((challenge) => {
                                const [date, time] = challenge.dateTime.split('T');
                                const [year, month, day] = date.split('-');
                                const [hour, minute] = time.split(':');
                                let dayText = '';
                                switch (day) {
                                    case '30':
                                        dayText = 'Donderdag';
                                        break;
                                    case '01':
                                        dayText = 'Vrijdag';
                                        break;
                                    case '02':
                                        dayText = 'Zaterdag';
                                        break;
                                    case '03':
                                        dayText = 'Zondag';
                                        break;
                                    case '04':
                                        dayText = 'Maandag';
                                        break;
                                }
                                return (
                                    <div key={challenge.fromTeam + challenge.toTeam} className={classNames(styles.challengeCard, { [styles.confirmed]: challenge.isConfirmed })}>
                                        <div className={styles.cardTop}>
                                            <p>{dayText}</p>
                                            <p>{hour}u{minute}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.toChallenges}>
                            <h1>Ontvangen</h1>
                            {toChallenges.map((challenge) => {
                                const [date, time] = challenge.dateTime.split('T');
                                const [year, month, day] = date.split('-');
                                const [hour, minute] = time.split(':');
                                let dayText = '';
                                switch (day) {
                                    case '30':
                                        dayText = 'Donderdag';
                                        break;
                                    case '01':
                                        dayText = 'Vrijdag';
                                        break;
                                    case '02':
                                        dayText = 'Zaterdag';
                                        break;
                                    case '03':
                                        dayText = 'Zondag';
                                        break;
                                    case '04':
                                        dayText = 'Maandag';
                                        break;
                                }
                                return (
                                    <div key={challenge.fromTeam + challenge.toTeam} className={classNames(styles.challengeCard, { [styles.confirmed]: challenge.isConfirmed })}>
                                        <div className={styles.cardTop}>
                                            <p>{dayText}</p>
                                            <p>{hour}u{minute}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div> :
                    <div>
                        <div className={styles.ownTeam}>
                            <div className={styles.titleDiv}>
                                <h1 className={styles.title}>Eigen <span>teamleden</span></h1>
                                <p className={styles.subTitle}><i>(maximaal 5 personen)</i></p>
                                <p className={styles.teamName}>Teamnaam: <span>{teamName}</span></p>
                            </div>
                            <ul className={styles.ownTeamList}>
                                {userArray.map((user, index) =>
                                    <li key={user.id} className={classNames({ [styles.empty]: user.name === 'Resterende plek' })}>
                                        {user.name === 'Resterende plek' ? <Help /> : iconArray[index]}
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
                                        <button onClick={() => handleChallenge(team)}>Uitdagen</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            }

            {
                (modalIsOpen && challengedTeam) &&
                    <Modal onClose={() => {
                        setModalIsOpen(false);
                        setChallengedTeam(null);
                    }}>
                        <h1 className={styles.modalTitle}>Zeker dat je <span>{challengedTeam?.name}</span> wilt uitdagen?</h1>
                        <form className={styles.modalForm} onSubmit={handleChallengeSubmit}>
                            <label htmlFor='timeInput'>Tijdstip</label>
                            <input type='datetime-local' className={styles.modalTime} onChange={(e) => setDateTime(e.target.value)} id='timeInput' min='2022-06-30T12:00' max='2022-07-04T12:00' required />
                            <label htmlFor='activity'>Activiteit</label>
                            <select onChange={(e) => setActivity(e.target.value)} className={styles.modalSelect} id='activity' defaultValue='' required>
                                <option value='' disabled hidden>Selecteer een activiteit</option>
                                <option value='kbc'>KBC - Raden</option>
                                <option value='winforlife'>Win for Life - Uitbeelden</option>
                                <option value='cola'>Coca Cola - Selfie</option>
                                <option value='twitch'>Twitch - Muziekgenres</option>
                                <option value='jupiler'>Jupiler - Snelheid</option>
                                <option value='stubru'>Studio Brussel - Quiz</option>
                                <option value='redbull'>Red Bull - Behendigheid</option>
                            </select>
                            <input type='submit' className={styles.modalSubmit} value='Bevestigen' />                              
                        </form>
                    </Modal>
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
