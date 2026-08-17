import styles from './SignInPage.module.css';
import AuthModal from '../../components/AuthModal/AuthModal';

export default function SignInPage() {
    return (
        <div className={styles.signInPage}>
            <div className={styles.signInGlow}/>

            <div className={styles.signInContent}>
                <div className={styles.brand}>
                    <div className={styles.brandMark}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round">
                            <path d="M12 2l2.9 6.3L21 9.3l-4.6 4.5L17.5 20 12 16.8 6.5 20l1.1-6.2L3 9.3l6.1-1z" />
                        </svg>
                    </div>
                    <div className={styles.brandName}>Connect Quest</div>
                </div>
                <AuthModal/>
            </div>
        </div>
    );
}
