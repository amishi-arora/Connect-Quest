import { useState } from "react";
import { signIn, signUp, signOut } from "aws-amplify/auth";
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const [tab, setTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    await signUp({
      username: signupEmail,
      password: signupPassword,
      options: { userAttributes: { email: signupEmail, name: signupName } },
    });

    await fetch("http://localhost:3000/api/confirm-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: signupEmail }),
    });
    await signOut(); // clear any existing session before logging in as the new user
    await signIn({ username: signupEmail, password: signupPassword });
  }

  async function handleLogin(e) {
    e.preventDefault();
    await signIn({ username: loginEmail, password: loginPassword });
  }

  return (

    <div className={styles.authModal}>
      <div className={styles.tabs}>
        <div className={`${styles.tab} ${tab === "login" ? styles.active : ""}`} onClick={() => setTab("login")}>
          Log in
        </div>
        <div className={`${styles.tab} ${tab === "signup" ? styles.active : ""}`} onClick={() => setTab("signup")}>
          Sign up
        </div>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin}>
          <h1>Welcome back</h1>
          <p className={styles.sub}>Log in to keep your streak going.</p>

          <div className={styles.field}>
            <label>Email</label>
            <div className={styles.inputWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn}>
            Log In
          </button>

          <div className={styles.switchLine}>
            Don't have an account? <a onClick={() => setTab("signup")}>Sign up</a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <h1>Create your account</h1>
          <p className={styles.sub}>Start completing quests and meeting people.</p>

          <div className={styles.field}>
            <label>Name</label>
            <div className={styles.inputWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <input
                type="text"
                placeholder="Amishi"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <div className={styles.inputWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn}>
            Create Account
          </button>

          <div className={styles.switchLine}>
            Already have an account? <a onClick={() => setTab("login")}>Log in</a>
          </div>
        </form>
      )}
    </div>
  );
}
