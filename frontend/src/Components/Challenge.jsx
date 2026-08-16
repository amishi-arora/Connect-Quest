import "./Challenge.css";
import AnswerPanel from "./AnswerPanel";
import ButtonHeader from "./ButtonHeader.jsx";
import "./ButtonHeader.css";
import { fetchChallenge } from "../services/api.js";
import React, { useEffect, useState } from 'react';

function genRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
  }


export default function Challenge() {
    const [challenge, setChallenge] = useState([]);

      // Fetch challenges using the API utility
    useEffect(() => {
    const getChallenge = async () => {
      try {
        const data = await fetchChallenge();
        // updates challenges with new data
        setChallenge(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getChallenge();
  }, []);
    return (
        <div>
        <ButtonHeader></ButtonHeader>
        <div>
            <div id = "answerDiv">
                <h1 className = "dailyChallenge">Todays challenge is...</h1>
                <div id = "challenge">
                    <h1 className = "dailyChallenge">{challenge.title}</h1>
                </div>
            </div>
            <AnswerPanel points = {challenge.pointsReward}/>
        </div>
        </div>
    ); 
}