import { useEffect, useState } from 'react';
import classNames from 'classnames';

import styles from './Modal.module.css';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

export const Modal = ({children, onClose}: ModalProps) => {
    const [closeAnimation, setCloseAnimation] = useState(false);

    useEffect(() => {
        document.body.classList.add(styles.noscroll);
        return () => {
          document.body.classList.remove(styles.noscroll);
        };
    });

    return (
        <div className={styles.container}>
            <div 
                className={classNames(styles.backdrop, {
                    [styles.modalClose]: closeAnimation,
                })}
                onClick={() => {
                    setCloseAnimation(true);
                    setTimeout(() => {
                      onClose();
                    }, 275);
                }}
            />

            <div
                className={classNames(styles.modal, {
                    [styles.modalClose]: closeAnimation,
                })}
            >
                {children}
                <button 
                    className={styles.modalCancel}
                    onClick={() => {
                        setCloseAnimation(true);
                        setTimeout(() => {
                          onClose();
                        }, 275);
                    }}
                >
                    X
                </button>  
            </div>
        </div>
    );
}
