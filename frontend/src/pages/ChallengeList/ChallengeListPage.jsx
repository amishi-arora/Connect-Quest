import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import styles from "./ChallengeListPage.module.css";
import ChallengeCard from "../../components/ChallengeCard/ChallengeCard";
import ChallengeDetailPanel from "../../components/ChallengeDetailPanel/ChallengeDetailPanel";
import CelebrationModal from "../../components/CelebrationModal/CelebrationModal";

export default function ChallengeListPage() {
  const [challenges, setChallenges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [dailyChallengeId, setDailyChallengeId] = useState(null);
  const [streak, setStreak] = useState(0);
  const dailyChallenge = challenges.find((c) => c.id === dailyChallengeId);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      fetch(`http://localhost:3000/api/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => res.json()),
      fetch(`http://localhost:3000/api/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch(`http://localhost:3000/api/daily-challenge`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([challengesData, progressData, dailyData]) => {
        const progressByChallengeId = {};
        progressData.forEach((p) => {
          progressByChallengeId[p.challengeId] = p;
        });

        const withStatus = challengesData.map((c) => {
          const progress = progressByChallengeId[c.id];
          return {
            ...c,
            completed: Boolean(progress),
            submittedAnswer: progress?.answer,
            submittedPhotoUrl: progress?.photoUrl,
          };
        });
        setChallenges(withStatus);
        setDailyChallengeId(dailyData.challenge.id);
        setStreak(dailyData.streak);

        const earned = withStatus
          .filter((c) => c.completed)
          .reduce((sum, c) => sum + c.points, 0);
        setTotalPoints(earned);
      })
      .catch((err) => console.error(err));
  }, []);

  async function handleLogout() {
    await signOut();
    localStorage.removeItem("token");
    navigate("/");
  }

  function openPanel(challenge) {
    setSelectedChallenge(challenge);
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
  }

  async function handleSubmit(challenge, answer) {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:3000/api/challenges/${challenge.id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ submission: answer }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.reason || data.message || "Submission failed");

    setChallenges((prev) =>
      prev.map((c) => (c.id === challenge.id ? { ...c, completed: true, submittedAnswer: answer, submittedPhotoUrl: data.photoUrl } : c))
    );
    setTotalPoints((prev) => prev + data.pointsEarned);
    if (challenge.id === dailyChallenge.id) {
      const dailyRes = await fetch(`${API_BASE}/api/daily-challenge`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dailyData = await dailyRes.json();
      setDailyStreak(dailyData.streak);
    }
    closePanel();
    setIsCelebrationOpen(true);

  }

  function closeCelebration() {
    setIsCelebrationOpen(false);
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
        <div className={styles.headerRight}>
          <div className={styles.headerPts}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M12 2l2.9 6.3L21 9.3l-4.6 4.5L17.5 20 12 16.8 6.5 20l1.1-6.2L3 9.3l6.1-1z" />
            </svg>
            {totalPoints} pts
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1>Challenge List</h1>
        <p className={styles.sub}>Complete challenges to earn points and connect on campus.</p>

        {streak > 0 && (
          <div className={styles.streakBanner}>
            🔥 {streak} day streak — keep it going!
          </div>
        )}

        {dailyChallenge && (
          <ChallengeCard challenge={dailyChallenge} onClick={openPanel} isDaily />
        )}

        {dailyChallengeId && <div className={styles.sectionLabel}>Other Challenges</div>}

        {challenges
          .filter((c) => c.id !== dailyChallengeId)
          .map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} onClick={openPanel} isDaily={false} />
          ))}
      </main>

      <ChallengeDetailPanel
        challenge={selectedChallenge}
        isOpen={isPanelOpen}
        onClose={closePanel}
        onSubmit={handleSubmit}
      />

      <CelebrationModal
        isOpen={isCelebrationOpen}
        challenge={selectedChallenge}
        totalPoints={totalPoints}
        onContinue={closeCelebration}
        isDaily={selectedChallenge?.id === dailyChallengeId}
      />
    </div>

  );
}