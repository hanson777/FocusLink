const API_BASE_URL =
  import.meta?.env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Request to ${path} failed with ${response.status}: ${errorText}`
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getProfile: () => request("/profile"),
  getTodayStats: () => request("/stats/today"),
  getWeeklyStats: () => request("/stats/weekly"),
  getFriends: () => request("/friends"),
  addFriend: (payload) =>
    request("/friends", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateGoals: (payload) =>
    request("/goals/daily", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  startTimerSession: (payload) =>
    request("/timer/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTimerSession: (sessionId, payload) =>
    request(`/timer/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export default api;
