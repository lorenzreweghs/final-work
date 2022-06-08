import classNames from 'classnames';

import { Action, ActionTypes } from '../Action';

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

            <div className={classNames(styles.close, { [styles.showClose]: isOpen })} onClick={() => setIsOpen(false)}>
                <Action type={ActionTypes.close} isActive />
            </div>
        </div>
    );
}
