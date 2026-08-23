import { useEffect } from "react";
import confetti from "canvas-confetti";
import styles from "./CelebrationModal.module.css";

export default function CelebrationModal({ isOpen, challenge, totalPoints, onContinue }) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: [
          "#FFB800",
          "#FF8A3D",
          "#FF6B9D",
          "#A78BFA", 
          "#60A5FA", 
          "#34D399", 
        ]
      });
    }
  }, [isOpen]);


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
