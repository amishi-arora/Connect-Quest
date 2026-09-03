const API_URL = "http://localhost:3000/api";

export async function getChallenges() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/challenges`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch challenges");
  }

  return response.json();
}

export async function getProgress() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch progress");
  }

  return response.json();
}

export async function getDailyChallenge() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/daily-challenge`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch daily challenge");
  }

  return response.json();
}

export async function submitChallenge(challengeId, answer) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/challenges/${challengeId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ submission: answer }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.reason || data.message || "Submission failed");
  }

  return data;
}

