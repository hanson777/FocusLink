const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://undelved-censorable-ethan.ngrok-free.dev/").replace(/\/$/, "");

const defaultHeaders = {
  "Content-Type": "application/json",
};

console.log("API_BASE_URL =", API_BASE_URL);

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "authToken",
  TOKEN_TYPE: "tokenType",
  USER: "user",
};

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

// Store login response in localStorage
function storeAuthData(data) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
  localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, data.token_type);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
}

// Get current user from localStorage
export function getCurrentUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Failed to parse user data:", e);
    return null;
  }
}

// Clear auth data from localStorage
export function clearAuthData() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function apiGet(path) {
  return request(path);
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut(path, body) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  // Add authorization header if token exists (except for auth endpoints)
  if (token && !path.includes("/auth/")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
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
  // Auth endpoints
  login: async (username, password) => {
    const response = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    // Store login response in localStorage
    storeAuthData(response);
    return response;
  },

  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Other endpoints
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
  updateUserStatus: (payload) =>
    request("/api/user-status", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export default api;
