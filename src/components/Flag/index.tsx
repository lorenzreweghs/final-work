/* eslint-disable @next/next/no-img-element */
import flagIcon from '../../../public/flag_icon.png';

import styles from './Flag.module.css';

interface FlagProps {
    setActiveStep: React.Dispatch<React.SetStateAction<number>>,
}

export const Flag = ({ setActiveStep }: FlagProps) => {
    return (
        <div className={styles.container}>
            <img className={styles.flagIcon} src={flagIcon.src} alt='flag icon' width='100%' height='auto' />
            <h1 className={styles.title}>Plaats een vlaggenmast</h1>
            <p className={styles.subTitle}>Dit wordt jullie eerste verzamelpunt</p>
        </div>
    );
}