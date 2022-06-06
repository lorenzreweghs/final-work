import { useEffect, useState } from 'react';
import { RedeemOutlined } from '@mui/icons-material';

import useProgress, { ActivityType } from '../../hooks/useProgress';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    activeSession: string | string[] | undefined,
    totalAmount: number,
}

export const ProgressBar = ({ activeSession, totalAmount }: ProgressBarProps) => {
    const { getProgress } = useProgress();

    const [completedAmount, setCompletedAmount] = useState(0);

    useEffect(() => {
        if(!activeSession) return;

        const getCompleted = async () => {
            let amount = 0;
            const activities = await getProgress(activeSession);
            activities.forEach((activity: ActivityType) => {
                if (activity.isCompleted) amount++;
            });
            setCompletedAmount(amount);
        }
        getCompleted();
    }, [activeSession]);

    return (
        <div className={styles.container}>
            <p>Je hebt <span>{completedAmount} van de {totalAmount}</span> activiteiten gewonnen!</p>
            <div className={styles.outerBar}>
                <div className={styles.innerBar} style={{ width: `${(completedAmount / totalAmount) * 100}%` }} />
                <RedeemOutlined fontSize='small' />
            </div>
        </div>
    );
}
