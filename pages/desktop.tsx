import styles from '../styles/Desktop.module.css';

const Desktop = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Festicon</h1>
            <h2 className={styles.subTitle}>Gebruik een <span>smartphone</span><br />om op het platform te geraken</h2>
        </div>
    );
}

export default Desktop;
