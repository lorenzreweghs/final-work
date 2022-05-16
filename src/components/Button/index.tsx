import Link from 'next/link';

import styles from './Button.module.css';

interface ButtonProps {
    href: string,
    text: string,
}

export const Button = ({href, text}: ButtonProps) => {
    return (
        <Link href={href}>
            <a className={styles.button}>{text}</a>
        </Link>
    );
}