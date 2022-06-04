import Link from 'next/link';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import styles from './Button.module.css';

export enum ButtonTypes {
    anchor = 'anchor',
    link = 'link',
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
        }
    }, [loadingSpinner, loadingText, href, text, type]);

    return (
        tag
    );
}