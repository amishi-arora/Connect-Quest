import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/SignInPage/SignInPage";
import ChallengeListPage from "./pages/ChallengeList/ChallengeListPage"

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
  const token = localStorage.getItem("token");
  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route
        path="/challenges"
        element={isTokenValid(token) ? <ChallengeListPage /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

