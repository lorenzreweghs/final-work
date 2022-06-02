import Swal from 'sweetalert2';

import styles from './Button.module.css';

interface ButtonProps {
    href: string,
    text: string,
    loadingSpinner?: boolean,
    loadingText?: string,
}

export const Button = ({href, text, loadingSpinner, loadingText}: ButtonProps) => {
    if (loadingSpinner) {
        Swal.fire(loadingText);
        Swal.showLoading();
    }

    return (
        <a href={href} className={styles.button}>{text}</a>
    );
}