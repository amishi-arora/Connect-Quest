import React, { useEffect, useState } from "react";
import "./ChallengeList.css";
import ButtonHeader from "./ButtonHeader.jsx";
import "./ButtonHeader.css";
import { fetchChallenges } from "../services/api.js";


const ChallengeList = () => {
  // Sample challenges/quests data
  // const challenges = [
  //   { id: 1, name: "Join a study group", status: "Completed" },
  //   { id: 2, name: "Explore a new campus spot", status: "Not Attempted" },
  //   { id: 3, name: "Participate in a club event", status: "Expired" },
  //   { id: 4, name: "Make a new friend", status: "Not Attempted" },
  //   { id: 5, name: "Give a compliment to someone on campus", status: "Not Attempted" },
  //   { id: 6, name: "Invite someone new to share lunch with you", status: "Completed" },
  //   { id: 7, name: "Find and take a picture of a unique spot on campus", status: "Expired" },
  //   { id: 8, name: "Explore a section of the library you've never visited", status: "Not Attempted" },
  //   { id: 9, name: "Locate and snap a photo of a piece of campus art", status: "Completed" },
  //   { id: 10, name: "Go to a building you've never entered and explore", status: "Expired" },
  //   { id: 11, name: "Attend a free workshop or seminar happening on campus", status: "Completed" },
  // ];

  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch challenges using the API utility
  useEffect(() => {
    const getChallenges = async () => {
      try {
        const data = await fetchChallenges();

        // updates challenges with new data
        setChallenges(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getChallenges();
  }, []);

  // TODO: update to take in challenge paramaters (title, description, pointsReward (int),isActive (bool),endDate (Date),challengeId (string)
  const handleClick = (challenge) => {
    alert(`Challenge: ${challenge.title}\n\nDescription: ${challenge.description}\n\nPoints: ${challenge.pointsReward}\n\nChallenge Status: ${challenge.isActive ? "Active" : "Inactive"}`);
  };

  return (
    <div>
      <ButtonHeader></ButtonHeader>
      <h1 id = "page-title">Challenge List</h1>
      <ul>
        {challenges.map((challenge) => (
        <li key={challenge.challengeId} className="challenge-item" onClick={() => handleClick(challenge)}>
            <span className="challenge-name">{challenge.title}</span>
            <span className="challenge-status">{challenge.pointsReward} pts</span>
        </li>
        ))}
      </ul>
    </div>
  );
};

// return (
//   <div>
//     <h1 id = "page-title">Challenge List</h1>
//     <ul style={{ listStyleType: "none", padding: 0 }}>
//       {challenges.map((challenge) => (
//       <li key={challenge.id} className="challenge-item" onClick={() => alert(`Challenge: ${challenge.name}`)}>
//         <strong>{challenge.name}</strong> - <em>{challenge.status}</em>
//       </li>
//       ))}
//     </ul>
//   </div>
// );
export default ChallengeList;
