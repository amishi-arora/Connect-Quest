import { useState, useEffect } from "react";
import styles from "./ChallengeDetailPanel.module.css";

export default function ChallengeDetailPanel({ challenge, isOpen, onClose, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setAnswer("");
    setPhotoFile(null);
    setPhotoPreview(null);
  }, [challenge]);

  if (!challenge) return null;

  const isPhotoChallenge = challenge.submissionType === "photo";

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function fileToResizedBase64(file, maxDimension = 1200) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };

      img.onerror = reject;
      img.src = objectUrl;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isPhotoChallenge) {
        if (!photoFile) {
          throw new Error("Please select a photo before submitting.");
        }
        const base64Image = await fileToResizedBase64(photoFile);
        await onSubmit(challenge, base64Image);
      } else {
        await onSubmit(challenge, answer);
      }
      setAnswer("");
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <>
      <div
        className={`${styles.overlayBg} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
      />
      <div className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.ptsPill}>+{challenge.points}</div>
        <h2>{challenge.title}</h2>
        <p className={styles.desc}>{challenge.description}</p>

        {challenge.requirements && challenge.requirements.length > 0 && (
          <>
            <div className={styles.reqTitle}>Requirements</div>
            {challenge.requirements.map((req, i) => (
              <div className={styles.reqItem} key={i}>
                <div className={styles.reqCheck}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                {req}
              </div>
            ))}
          </>
        )}

        {challenge.completed ? (
          <div className={styles.doneBlock}>
            <div className={styles.doneMessage}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              You've already completed this challenge
            </div>
            {challenge.submittedPhotoUrl && (
              <>
                <div className={styles.fieldLabel}>Your submitted photo</div>
                <img src={challenge.submittedPhotoUrl} alt="Your submission" className={styles.photoPreview} />
              </>
            )}
            {challenge.submittedAnswer && !isPhotoChallenge && (
              <>
                <div className={styles.fieldLabel}>What you accomplished</div>
                <div className={styles.answerReadout}>{challenge.submittedAnswer}</div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {isPhotoChallenge ? (
              <>
                <div className={styles.fieldLabel}>Upload your photo</div>
                <label className={styles.photoDropzone}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className={styles.photoInput}
                  />
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      Tap to choose a photo
                    </div>
                  )}
                </label>
              </>
            ) : (
              <>
                <div className={styles.fieldLabel}>What did you accomplish?</div>
                <textarea
                  placeholder="Describe what you did to complete this challenge. Be specific about your experience!"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  maxLength={500}
                  required
                />
                <div className={styles.charCount}>
                  {answer.length}/500
                </div>
              </>
            )}

            {error && <div className={styles.submitError}>{error}</div>}

            <div className={styles.aiNote}>
              Your submission is automatically reviewed by AI
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit challenge"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}