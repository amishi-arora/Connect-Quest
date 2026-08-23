import { useEffect, useState } from "react";
import styles from "./ChallengeListPage.module.css";
import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import ChallengeDetailPanel from "../../components/ChallengeDetailPanel/ChallengeDetailPanel";

export default function ChallengeListPage() {
  const [challenges, setChallenges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/challenges`)
      .then((res) => res.json())
      .then((data) => {
        const withStatus = data.map((c) => ({ ...c, completed: false }));
        setChallenges(withStatus);

        const earned = withStatus
          .filter((c) => c.completed)
          .reduce((sum, c) => sum + c.points, 0);
        setTotalPoints(earned);
      })
      .catch((err) => console.error("Failed to load challenges:", err));
  }, []);

  function openPanel(challenge) {
    setSelectedChallenge(challenge);
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round">
              <path d="M12 2l2.9 6.3L21 9.3l-4.6 4.5L17.5 20 12 16.8 6.5 20l1.1-6.2L3 9.3l6.1-1z" />
            </svg>
          </div>
          <div className={styles.brandName}>Connect Quest</div>
        </div>
        <div className={styles.headerPts}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="M12 2l2.9 6.3L21 9.3l-4.6 4.5L17.5 20 12 16.8 6.5 20l1.1-6.2L3 9.3l6.1-1z" />
          </svg>
          {totalPoints} pts
        </div>
      </header>

      <main className={styles.main}>
        <h1>Challenge List</h1>
        <p className={styles.sub}>Complete challenges to earn points and connect on campus.</p>

        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} onClick={openPanel} />
        ))}
      </main>

      <ChallengeDetailPanel
        challenge={selectedChallenge}
        isOpen={isPanelOpen}
        onClose={closePanel}
      />
    </div>

  );
}