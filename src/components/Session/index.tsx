/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { generate } from 'generate-password';
import { useUser } from '@auth0/nextjs-auth0';
import { Piano, SportsBasketball, SportsSoccer, SportsEsports, SportsBar, Agriculture } from '@mui/icons-material';
import randomColor from 'randomcolor';

import connectionIcon from '../../../public/connection_icon_color.png';
import useSession from '../../hooks/useSession';
import useOtherUser from '../../hooks/useOtherUser';
import { SessionSteps } from '../../../pages/session';

import styles from './Session.module.css';

interface SessionProps {
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
    setActiveSession: React.Dispatch<React.SetStateAction<string>>,
}

export const Session = ({ setActiveStep, setActiveSession }: SessionProps) => {
    const { user, isLoading } = useUser();
    const { hasSession, getSession, existSession, updateSession, getUsersInSession } = useSession();
    const { getTeams } = useOtherUser();
    const router = useRouter();

    const [personalIcon, setPersonalIcon] = useState('beer');
    const [teams, setTeams] = useState<Array<{name: string, session: string, people: number}>>([]);
    const [lastSession, setLastSession] = useState('');

    useEffect(() => {
      if (isLoading) return;

      setPersonalIcon(localStorage.getItem('icon') ?? 'beer');

      const getTeamsArray = async () => {
        const teamsArray = await getTeams();
        setTeams(teamsArray);
      }
      getTeamsArray();

      const getSessionStatus = async () => {
        if (await hasSession(user?.sub!)) {
          setLastSession(await getSession(user?.sub!));
        }
      }
      getSessionStatus();
    }, [isLoading]);
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      const session = generate({
        length: 6,
        numbers: true,
        lowercase: false,
        excludeSimilarCharacters: true,
      });
      setActiveSession(session);
      
      localStorage.setItem('icon', personalIcon);
      const iconColor = randomColor({
        luminosity: 'dark',
      });

      await updateSession(user?.sub!, [{id: user?.sub!, name: user?.name!}], teams, user?.name!, personalIcon, iconColor, session);
      setActiveStep(SessionSteps.Flag);
    }
  
    const handleChange = async (e: any) => {
      const session = e.target.value;
      if (session) {
        const sessionExists = await existSession(session);
        if (sessionExists) {
          const users = await getUsersInSession(session);

          let containsUser = false;
          users.forEach((element) => {
            if (element.id.includes(user?.sub!)) containsUser = true;
          });

          let userArray = [];
          if (containsUser) userArray = [...users];
          else userArray = [...users, {id: user?.sub!, name: user?.name!}];

          localStorage.setItem('icon', personalIcon);
          const iconColor = randomColor({
            luminosity: 'dark',
          });

          let teamArray = teams;
          teamArray.forEach((team) => {
            if (team.session === session && !containsUser) team.people++;
          });

          await updateSession(user?.sub!, userArray, teamArray, user?.name!, personalIcon, iconColor, session);
          router.push('/map/' + session);
        }
      }
    }

    return (
        <div className={styles.container}>
          <img className={styles.connectionIcon} src={connectionIcon.src} alt='connection icon' width='100%' height='auto' />
          <h1 className={styles.title}>Maak een sessie aan</h1>
          <p className={styles.subTitle}>Of join de sessie van je vrienden</p>

          <form className={styles.iconForm} onSubmit={handleSubmit}>
              <p className={styles.iconTitle}>Kies je <span>persoonlijk</span> icoontje*</p>

              <div className={styles.icons}>
                  <input type="radio" id="beer" name="icon" value="beer" onChange={(e) => setPersonalIcon(e.target.value)} defaultChecked={personalIcon === 'beer'} />
                  <label htmlFor="beer">
                  <SportsBar fontSize='large' />
                  </label>

                  <input type="radio" id="basketball" name="icon" value="basketball" onChange={(e) => setPersonalIcon(e.target.value)} defaultChecked={personalIcon === 'basketball'} />
                  <label htmlFor="basketball">
                  <SportsBasketball fontSize='large' />
                  </label>

                  <input type="radio" id="soccer" name="icon" value="soccer" onChange={(e) => setPersonalIcon(e.target.value)} defaultChecked={personalIcon === 'soccer'} />
                  <label htmlFor="soccer">
                  <SportsSoccer fontSize='large' />
                  </label>

                  <input type="radio" id="gaming" name="icon" value="gaming" onChange={(e) => setPersonalIcon(e.target.value)} defaultChecked={personalIcon === 'gaming'} />
                  <label htmlFor="gaming">
                  <SportsEsports fontSize='large' />
                  </label>

                  <input type="radio" id="piano" name="icon" value="piano" onChange={(e) => setPersonalIcon(e.target.value)} defaultChecked={personalIcon === 'piano'} />
                  <label htmlFor="piano">
                  <Piano fontSize='large' />
                  </label>

                  <input type="radio" id="tractor" name="icon" value="tractor" onChange={(e) => setPersonalIcon(e.target.value)} defaultChecked={personalIcon === 'tractor'} />
                  <label htmlFor="tractor">
                  <Agriculture fontSize='large' />
                  </label>
              </div>

              <div className={styles.codeDiv}>
                  <p>CODE</p>
                  <input type='text' className={styles.codeSubmit} placeholder='_ _ _ _ _ _' minLength={6} maxLength={6} onChange={handleChange} />
              </div>
              <p className={styles.or}>of</p>
              <input type='submit' className={styles.newSession} value='Start nieuwe sessie' />
          </form>
          {
            lastSession &&
              <Link href={`/map/${lastSession}`}>
                <a className={styles.lastSession}>Ga naar je laatste actieve sessie</a>                        
              </Link>
          }
        </div>
    );
}