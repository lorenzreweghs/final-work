import Link from 'next/link';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { MapOutlined, GroupsOutlined } from '@mui/icons-material';
import classNames from 'classnames';

import styles from './Button.module.css';

export enum ButtonTypes {
    anchor = 'anchor',
    link = 'link',
    teams = 'teams',
    map = 'map',
}

interface ButtonProps {
    href: string,
    text: string,
    type?: ButtonTypes,
    loadingSpinner?: boolean,
    loadingText?: string,
}

export const Button = ({href, text, type = ButtonTypes.link, loadingSpinner, loadingText}: ButtonProps) => {
    const [tag, setTag] = useState(<div />);

    useEffect(() => {
        if (loadingSpinner) {
            Swal.fire({
                title: loadingText,
                allowOutsideClick: false,
            });
            Swal.showLoading();
        }

        switch (type) {
            case ButtonTypes.link:
                setTag(
                    <Link href={href}>
                        <a className={styles.button}>{text}</a>
                    </Link>
                    );
                break;
            case ButtonTypes.anchor:
                setTag(
                    <a href={href} className={styles.button}>{text}</a>
                );
                break;
            case ButtonTypes.teams:
                setTag(
                    <Link href={href}>
                        <a className={classNames(styles.button, styles.teams)}>
                            <GroupsOutlined fontSize='large' />
                            {text}
                        </a>
                    </Link>
                );
                break;
            case ButtonTypes.map:
                setTag(
                    <Link href={href}>
                        <a className={styles.button}>
                            <MapOutlined fontSize='large' />
                            {text}
                        </a>
                    </Link>
                );
                break;
        }
    }, [loadingSpinner, loadingText, href, text, type]);

    return (
        tag
    );
}