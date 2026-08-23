import styles from "./CelebrationModal.module.css";
 
export default function CelebrationModal({ isOpen, challenge, totalPoints, onContinue }) {
  if (!challenge) return null;
 
  return (
    <div className={`${styles.celebrate} ${isOpen ? styles.open : ""}`}>
      <div className={styles.card}>
        <div className={styles.checkCircle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
 
        <h2>Congratulations!</h2>
        <div className={styles.sub}>
          You completed <strong>&quot;{challenge.title}&quot;</strong>
        </div>
 
        <div className={styles.pointsEarned}>
          <div className={styles.plabel}>Points earned</div>
          <div className={styles.pnum}>+{challenge.points}</div>
          <div className={styles.ptotal}>Total: {totalPoints} points</div>
        </div>
 
        <button className={styles.continueBtn} onClick={onContinue}>
          Continue challenges
        </button>
      </div>
    </div>
  );
}
 