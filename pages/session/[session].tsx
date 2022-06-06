/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
import { Piano, SportsBasketball, SportsSoccer, SportsEsports, SportsBar, Agriculture } from '@mui/icons-material';
import Swal from 'sweetalert2';

import logo from '../../public/rock-werchter-2022.png';
import connectionIcon from '../../public/connection_icon_color.png';
import useSession from '../../src/hooks/useSession';
import useOtherUser from '../../src/hooks/useOtherUser';

import styles from '../../src/components/Session/Session.module.css';

const JoinSession = () => {
    const { user, isLoading } = useUser();
    const { hasSession, getSession, existSession, updateSession, getUsersInSession } = useSession();
    const { getTeams } = useOtherUser();
    const router = useRouter();

    const [personalIcon, setPersonalIcon] = useState('beer');
    const [teams, setTeams] = useState<Array<{name: string, session: string, people: number}>>([]);
    const [lastSession, setLastSession] = useState('');
    const [currentSession, setCurrentSession] = useState<string | string[] | undefined>('');

    useEffect(() => {
        if (!router.isReady) return;
        const { session } = router.query;
        setCurrentSession(session);
    }, [router.isReady]);

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
        const sessionExists = await existSession(currentSession);
        if (sessionExists) {
            const users = await getUsersInSession(currentSession);
    
            let containsUser = false;
            users.forEach((element) => {
                if (element.id.includes(user?.sub!)) containsUser = true;
            });
    
            let userArray = [];
            if (containsUser) userArray = [...users];
            else userArray = [...users, {id: user?.sub!, name: user?.name!}];
    
            localStorage.setItem('icon', personalIcon);
    
            let teamArray = teams;
            teamArray.forEach((team) => {
                if (team.session === currentSession && !containsUser) team.people++;
            });
    
            await updateSession(user?.sub!, userArray, teamArray, user?.name!, personalIcon, currentSession);
            router.push('/map/' + currentSession);
        } else {
            Swal.fire({
                title: 'Sessie bestaat niet',
                icon: 'error',
                timer: 2500,
                timerProgressBar: true,
                allowOutsideClick: false,
            });
            Swal.showLoading();
            setTimeout(() => {
                router.push('/session');
            }, 2500);
        }
    }

    return (
        <div className={styles.container}>
          <header className={styles.banner} onClick={() => router.push('/')} />

          <img className={styles.connectionIcon} src={connectionIcon.src} alt='connection icon' width='100%' height='auto' />
          <h1 className={styles.title}>Uitnodiging</h1>
          <p className={styles.subTitle}>Join de sessie van je vrienden</p>

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
                  <input type='text' className={styles.codeSubmit} placeholder='_ _ _ _ _ _' minLength={6} maxLength={6} value={currentSession} readOnly />
              </div>
              <p className={styles.or}></p>
              <input type='submit' className={styles.newSession} value='Bevestigen' />
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

export default JoinSession;
