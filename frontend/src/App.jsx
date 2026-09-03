import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import SignInPage from "./pages/SignInPage/SignInPage";
import ChallengeListPage from "./pages/ChallengeListPage/ChallengeListPage"

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <Routes>
      <Route path="/" element={isTokenValid(token) ? <Navigate to="/challenges" /> : <SignInPage setToken={setToken}/>} />
      <Route
        path="/challenges"
        element={isTokenValid(token) ? <ChallengeListPage setToken={setToken}/> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

