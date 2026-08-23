import styles from "./ChallengeCard.module.css";
 
export default function ChallengeCard({ challenge }) {
  const { title, description, points, completed } = challenge;
 
  return (
    <div className={`${styles.card} ${completed ? styles.done : ""}`}>
      <div className={styles.statusDot}>
        {completed ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" />
          </svg>
        )}
      </div>
 
      <div className={styles.cardText}>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
 
      <div className={styles.ptsPill}>+{points}</div>
    </div>
  );
}
 