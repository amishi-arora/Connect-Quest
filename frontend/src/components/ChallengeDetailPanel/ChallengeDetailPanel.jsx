import { useState } from "react";
import styles from "./ChallengeDetailPanel.module.css";

export default function ChallengeDetailPanel({ challenge, isOpen, onClose, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!challenge) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(challenge, answer);
      setAnswer("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className={`${styles.overlayBg} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
      />
      <div className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.ptsPill}>+{challenge.points}</div>
        <h2>{challenge.title}</h2>
        <p className={styles.desc}>{challenge.description}</p>

        {challenge.requirements && challenge.requirements.length > 0 && (
          <>
            <div className={styles.reqTitle}>Requirements</div>
            {challenge.requirements.map((req, i) => (
              <div className={styles.reqItem} key={i}>
                <div className={styles.reqCheck}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                {req}
              </div>
            ))}
          </>
        )}

        {challenge.completed ? (
          <div className={styles.doneBlock}>
            <div className={styles.doneMessage}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              You've already completed this challenge
            </div>
            {challenge.submittedAnswer && (
              <>
                <div className={styles.fieldLabel}>What you accomplished</div>
                <div className={styles.answerReadout}>{challenge.submittedAnswer}</div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.fieldLabel}>What did you accomplish?</div>
            <textarea
              placeholder="Describe what you did to complete this challenge. Be specific about your experience!"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit challenge"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}