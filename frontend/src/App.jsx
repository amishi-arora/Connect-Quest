import "./index.css";
import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage/SignInPage";
import ChallengeListPage from "./pages/ChallengeList/ChallengeListPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/challenges" element={<ChallengeListPage />} />
    </Routes>
  );
}

