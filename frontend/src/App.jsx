import "./index.css"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage/SignInPage";
import ChallengeList from "./components/ChallengeList"
import Challenge from "./components/Challenge"

export default function App() {
  return (
    <Router>
      <div className="App">
          <Routes>
            <Route path="/" element={<SignInPage />} />
            <Route path="/challenges" element={<ChallengeList />} />
            <Route path="/daily" element={<Challenge />} />
          </Routes>
      </div>
    </Router>
  );
}

