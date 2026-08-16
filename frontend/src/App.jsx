import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogIn from "./Components/LogIn.jsx";

import "./index.css";
import ChallengeList from "./Components/ChallengeList.jsx";
import Challenge from "./Components/Challenge.jsx";
import { useLocation } from 'react-router'

export default function App() {
  return (
    <Router>
      <div className="App">
          <Routes>
            <Route index element={<LogIn />} />
            <Route path="/home" element={<LogIn />} />
            <Route path="/challenges" element={<ChallengeList />} />
            <Route path="/daily" element={<Challenge />} />
          </Routes>
      </div>
    </Router>
  );
}

