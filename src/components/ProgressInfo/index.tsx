import classNames from 'classnames';

import { Action, ActionTypes } from '../Action';

import styles from './ProgressInfo.module.css';

interface ProgressProps {
    activeSession: string | string[] | undefined,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
}

export const ProgressInfo = ({ activeSession, setIsOpen, isOpen }: ProgressProps) => {
    return (
        <div className={classNames(styles.container, { [styles.open]: isOpen })}>
            <div className={styles.close} onClick={() => setIsOpen(false)}>
                <Action type={ActionTypes.close} />
            </div>
        </div>
    );
}
