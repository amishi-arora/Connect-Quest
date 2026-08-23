import "./index.css";
import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage/SignInPage";
import ChallengeListPage from "./pages/ChallengeList/ChallengeListPage"
import Challenge from "./components/Challenge"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/challenges" element={<ChallengeListPage />} />
    </Routes>
  );
}

