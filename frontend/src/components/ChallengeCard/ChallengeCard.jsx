import styles from "./ChallengeCard.module.css";

export default function ChallengeCard({ challenge, onClick, isDaily }) {
  const { title, description, points, completed } = challenge;

  return (
    <div onClick={() => onClick(challenge)} className={`${styles.card} ${completed ? styles.done : ""} ${isDaily ? styles.daily : ""}`}>
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
        {isDaily && <div className={styles.dailyTag}>🔥 Today's Challenge</div>}
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <div className={styles.ptsPill}>+{points}</div>
    </div>
  );
}
