import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp, signOut, fetchAuthSession } from "aws-amplify/auth";
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function signInUser(email, password) {
    try {
      await signIn({
        username: email,
        password,
      });
    } catch (err) {
      if (err.name !== "UserAlreadyAuthenticatedException") {
        throw err;
      }
      await signOut();

      await signIn({
        username: email,
        password,
      });
    }
  }

  async function saveAuthToken() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error("Failed to retrieve authentication token");
    }

    localStorage.setItem("token", token);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (signupPassword !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }

      await signUp({
        username: signupEmail,
        password: signupPassword,
        options: {
          userAttributes: {
            email: signupEmail,
            name: signupName,
          },
        },
      });

      await signInUser(signupEmail, signupPassword);

      await saveAuthToken();

      navigate("/challenges");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }


  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await signInUser(loginEmail, loginPassword); 
      await saveAuthToken();
      navigate("/challenges");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(newTab) {
    setError("");
    setTab(newTab);
  }

  return (

    <div className={styles.authModal}>
      <div className={styles.tabs}>
        <div className={`${styles.tab} ${tab === "login" ? styles.active : ""}`} onClick={() => switchTab("login")}>
          Log in
        </div>
        <div className={`${styles.tab} ${tab === "signup" ? styles.active : ""}`} onClick={() => switchTab("signup")}>
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

          {error && <div className={styles.authError}>{error}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : "Log In"}
          </button>

          <div className={styles.switchLine}>
            Don't have an account?{" "}
            <button type="button" className={styles.linkBtn} onClick={() => switchTab("signup")}>
              Sign up
            </button>
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

          <div className={styles.field}>
            <label>Confirm password</label>
            <div className={styles.inputWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className={styles.authError}>{error}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : "Create Account"}
          </button>

          <div className={styles.switchLine}>
            Already have an account?{" "}
            <button type="button" className={styles.linkBtn} onClick={() => switchTab("login")}>
              Log in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
