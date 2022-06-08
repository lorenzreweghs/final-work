/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames';
import { Piano, SportsBasketball, SportsSoccer, SportsEsports, SportsBar, Agriculture } from '@mui/icons-material';

import { Action, ActionTypes } from '../Action';

import flagIcon from '../../../public/flag_icon_color.png';
import tentIcon from '../../../public/campground_icon.png';
import pinIcon from '../../../public/pin_icon_color.png';

import styles from './Information.module.css';

interface InformationProps {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
}

export const Information = ({ setIsOpen, isOpen }: InformationProps) => {
    return (
        <div className={classNames(styles.container, { [styles.open]: isOpen })}>
            <div className={styles.banner} />

            <h1 className={styles.title}><span>Verduidelijking</span> van de kaart</h1>

            <div className={styles.gatherAction}>
                <div className={styles.iconDiv}>
                    <Action type={ActionTypes.gather} />
                </div>
                <p className={styles.iconText}><span>Verzamelpunt</span> aanduiden</p>
            </div>

            <div className={styles.tentAction}>
                <div className={styles.iconDiv}>
                    <Action type={ActionTypes.tent} />
                </div>
                <p className={styles.iconText}><span>Tentlocatie</span> instellen</p>
            </div>

            <div className={styles.pinAction}>
                <div className={styles.iconDiv}>
                    <Action type={ActionTypes.pinpoint} />
                </div>
                <p className={styles.iconText}><span>Point of Interest</span> toevoegen</p>
            </div>

            <div className={styles.gather}>
                <div className={styles.iconDiv}>
                    <img src={flagIcon.src} alt='flag icon' width='30px' height='auto' />
                </div>
                <p className={styles.iconText}><span>Verzamelpunt</span> aanduiden</p>
            </div>

            <div className={styles.tent}>
                <div className={styles.iconDiv}>
                   <img src={tentIcon.src} alt='tent icon' width='35px' height='auto' /> 
                </div>
                <p className={styles.iconText}><span>Tentlocatie</span> instellen</p>
            </div>

            <div className={styles.pin}>
                <div className={styles.iconDiv}>
                   <img src={pinIcon.src} alt='tent icon' width='22.5px' height='auto' /> 
                </div>
                <p className={styles.iconText}><span>Point of Interest</span> toevoegen</p>
            </div>

            <div className={styles.icons}>
                <SportsBar fontSize='large' />
                <SportsBasketball fontSize='large' />
                <SportsSoccer fontSize='large' />
                <SportsEsports fontSize='large' />
                <Piano fontSize='large' />
                <Agriculture fontSize='large' />
            </div>
            <p className={styles.iconsSubTitle}>Festivalgangers</p>

            <div className={classNames(styles.close, { [styles.showClose]: isOpen })} onClick={() => setIsOpen(false)}>
                <Action type={ActionTypes.close} isActive />
            </div>
        </div>
    );
}
