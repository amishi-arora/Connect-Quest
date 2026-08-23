import { useEffect, useState } from "react";
import styles from "./ChallengeListPage.module.css";

// Mock data
const MOCK_CHALLENGES = [
  {
    id: "1",
    title: "Join a study group",
    description: "Participate in a study group to enhance your learning experience.",
    points: 10,
    completed: true,
  },
  {
    id: "2",
    title: "Explore a new campus spot",
    description: "Discover a new location on campus you've never visited before.",
    points: 5,
    completed: false,
  },
  {
    id: "3",
    title: "Participate in a club event",
    description: "Engage in a club activity to broaden your social network and skills.",
    points: 15,
    completed: false,
  },
  {
    id: "4",
    title: "Make a new friend",
    description: "Strike up a conversation and connect with someone new on campus.",
    points: 10,
    completed: false,
  },
  {
    id: "5",
    title: "Snap a photo of campus art",
    description: "Find and photograph a piece of art displayed somewhere on campus.",
    points: 10,
    completed: false,
  },
];

export default function ChallengeListPage() {
  const [challenges, setChallenges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    // TODO: replace with a real fetch once GET /api/challenges exists:
    setChallenges(MOCK_CHALLENGES);

    const earned = MOCK_CHALLENGES
      .filter((c) => c.completed)
      .reduce((sum, c) => sum + c.points, 0);
    setTotalPoints(earned);
  }, []);

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

        {/* TODO: Define ChallengeCard component */}
        {/* {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))} */}
      </main>
    </div>
  );
}