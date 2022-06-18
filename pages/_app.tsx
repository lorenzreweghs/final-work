import { UserProvider } from '@auth0/nextjs-auth0';

import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const setWindowHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight/100}px`);
    }
    setWindowHeight();
    window.addEventListener('resize', setWindowHeight);

    return () => {
        window.removeEventListener('resize', setWindowHeight);
    }
  });

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
