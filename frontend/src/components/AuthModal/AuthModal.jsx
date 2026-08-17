import { useState } from "react";
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const [tab, setTab] = useState("login");

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
        <form>
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
        <form >
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
