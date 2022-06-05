/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import classNames from 'classnames';

import gatherIcon from '../../../public/assembly_icon.png';
import tentIcon from '../../../public/campground_icon.png';
import pinIcon from '../../../public/pin_icon.png';
import mapIcon from '../../../public/map_icon.png';
import menuIcon from '../../../public/menu_icon.png';
import closeIcon from '../../../public/close_icon.png';
import infoIcon from '../../../public/info_icon.png';

import styles from './Action.module.css';

export enum ActionTypes {
    gather = 'gather',
    tent = 'tent',
    pinpoint = 'pinpoint',
    map = 'map',
    menu = 'menu',
    close = 'close',
    info = 'info',
}

interface ActionProps {
    type: ActionTypes,
    isActive?: boolean,
}

export const Action = ({ type, isActive = false }: ActionProps) => {
    const [icon, setIcon] = useState(<span />);

    useEffect(() => {
        switch (type) {
            case ActionTypes.gather:
                setIcon(<img src={gatherIcon.src} alt='meeting point icon' width='34px' height='auto' />);
                break;
            case ActionTypes.tent:
                setIcon(<img src={tentIcon.src} alt='tent campground icon' width='36px' height='auto' />);
                break;
            case ActionTypes.pinpoint:
                setIcon(<img src={pinIcon.src} alt='map pinpoint icon' width='22.5px' height='auto' />);
                break;
            case ActionTypes.map:
                setIcon(<img src={mapIcon.src} alt='map icon' width='28.5px' height='auto' />);
                break;
            case ActionTypes.menu:
                setIcon(<img src={menuIcon.src} alt='menu icon' width='27px' height='auto' />);
                break;
            case ActionTypes.close:
                setIcon(<img src={closeIcon.src} alt='close icon' width='25.5px' height='auto' />);
                break;
            case ActionTypes.info:
                setIcon(<img src={infoIcon.src} alt='info icon' width='11px' height='auto' />);
                break;
        }        
    }, [type]);

    return (
        <div className={classNames(styles.container, { [styles.active]: isActive })}>
            {icon}
        </div>
    );
}