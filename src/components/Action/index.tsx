/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import gatherIcon from '../../../public/assembly_icon.png';
import tentIcon from '../../../public/campground_icon.png';
import pinIcon from '../../../public/pin_icon.png';

import styles from './Action.module.css';

export enum ActionTypes {
    gather = 'gather',
    tent = 'tent',
    pinpoint = 'pinpoint',
}

interface ActionProps {
    type: ActionTypes,
}

export const Action = ({ type }: ActionProps) => {
    let [icon, setIcon] = useState(<span />);

    useEffect(() => {
        switch (type) {
            case ActionTypes.gather:
                setIcon(<img src={gatherIcon.src} alt='meeting point icon' width='36px' height='auto' />);
                break;
            case ActionTypes.tent:
                setIcon(<img src={tentIcon.src} alt='tent campground icon' width='38px' height='auto' />);
                break;
            case ActionTypes.pinpoint:
                setIcon(<img src={pinIcon.src} alt='map pinpoint icon' width='22.5px' height='auto' />);
                break;
        }        
    }, [type]);

    return (
        <div className={styles.container}>
            {icon}
        </div>
    );
}