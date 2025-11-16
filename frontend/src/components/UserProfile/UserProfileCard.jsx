import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api";
import api from "../../api";

export default function UserProfileCard({
  viewingUsername = null, // If provided, show this user's profile instead of current user
  onClick,
  className,
}) {
  const [status, setStatus] = useState("Idle");
  const [username, setUsername] = useState("Loading...");
  const [userUid, setUserUid] = useState(null);
  const [lifetimeStats, setLifetimeStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    longestStreak: 0,
    averageSession: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [viewingUsername]);

  // Separate effect for status updates
  useEffect(() => {
    if (!viewingUsername) {
      // Only fetch status for current user
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    } else if (userUid) {
      // For friend profiles, fetch their status once when UID is available
      fetchFriendStatus();
    }
  }, [viewingUsername, userUid]);

  async function loadUserData() {
    try {
      setLoading(true);
      
      if (viewingUsername) {
        // Loading a friend's profile
        await loadFriendProfile(viewingUsername);
      } else {
        // Loading current user's profile
        await loadCurrentUserProfile();
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
      setUsername("Unknown");
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUserProfile() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.uid) {
      console.error("No current user found");
      setUsername("Unknown");
      return;
    }

    // Load user profile data with stats from API
    try {
      const userData = await api.getUser(currentUser.uid);
      setUsername(userData.username || currentUser.username || "Unknown");
      setUserUid(currentUser.uid);
      
      // Use stats from API response
      setLifetimeStats({
        totalSessions: userData.total_study_sessions || 0,
        totalMinutes: userData.total_study_minutes || 0,
        longestStreak: userData.longest_streak || 0,
        averageSession: userData.average_session_minutes || 0,
      });
    } catch (err) {
      console.error("Failed to load user data:", err);
      // Fallback to username from localStorage
      setUsername(currentUser.username || "Unknown");
      setUserUid(currentUser.uid);
      // Keep default stats if fetch fails
    }
  }

  async function loadFriendProfile(friendUsername) {
    try {
      // Search for the user by username
      const searchResults = await api.searchUsers(friendUsername);
      
      if (!searchResults || searchResults.length === 0) {
        console.error("Friend not found:", friendUsername);
        setUsername(friendUsername);
        return;
      }

      // Find exact match (case-insensitive)
      const friend = searchResults.find(
        (u) => u.username.toLowerCase() === friendUsername.toLowerCase()
      ) || searchResults[0];

      if (friend && friend.uid) {
        setUsername(friend.username);
        setUserUid(friend.uid);
        
        // Get full user data with stats from API
        try {
          const userData = await api.getUser(friend.uid);
          setUsername(userData.username || friend.username);
          
          // Use stats from API response
          setLifetimeStats({
            totalSessions: userData.total_study_sessions || 0,
            totalMinutes: userData.total_study_minutes || 0,
            longestStreak: userData.longest_streak || 0,
            averageSession: userData.average_session_minutes || 0,
          });
        } catch (err) {
          console.error("Failed to load friend's full profile:", err);
          // Set default stats if fetch fails
          setLifetimeStats({
            totalSessions: 0,
            totalMinutes: 0,
            longestStreak: 0,
            averageSession: 0,
          });
        }
        
        // Fetch friend's status after UID is set
        // This will be triggered by the useEffect that watches userUid
      } else {
        setUsername(friendUsername);
      }
    } catch (err) {
      console.error("Failed to load friend profile:", err);
      setUsername(friendUsername);
    }
  }

  async function fetchFriendStatus() {
    if (!userUid) return;
    
    try {
      const data = await api.getUserStatusByUid(userUid);
      setStatus(data.status ?? "Idle");
    } catch (err) {
      console.error("Failed to load friend status", err);
      setStatus("Idle");
    }
  }


  async function fetchStatus() {
    try {
      const data = await api.getUserStatus();
      // backend returns { uid, status, user_uid, created_at, updated_at }
      setStatus(data.status ?? "Idle");
    } catch (err) {
      console.error("Failed to load status", err);
    }
  }

  const statusColor =
    status === "Focusing"
      ? "bg-success"
      : status === "Idle"
      ? "bg-text/40"
      : "bg-danger";

  return (
    <div
      className={`card ${onClick ? "cursor-pointer hover:shadow-lg transition" : ""} ${className ?? ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <h2 className="section-title">Profile</h2>

      <div className="flex items-center gap-4 mt-4">
        <div className="w-14 h-14 rounded-full bg-surfaceLight flex items-center justify-center text-2xl font-bold text-primary">
          {loading ? "..." : (username && username[0] ? username[0].toUpperCase() : "?")}
        </div>

        <div>
          <p className="text-xl font-semibold text-textLight">
            {loading ? "Loading..." : username}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
            <span className="text-sm text-textLight/70">{status}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Total Sessions</p>
          <p className="text-2xl font-bold text-primary">
            {lifetimeStats.totalSessions}
          </p>
        </div>

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Total Minutes</p>
          <p className="text-2xl font-bold text-accent">
            {lifetimeStats.totalMinutes}
          </p>
        </div>

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Longest Streak</p>
          <p className="text-2xl font-bold text-primary">
            {lifetimeStats.longestStreak}
          </p>
        </div>

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Avg Session (min)</p>
          <p className="text-2xl font-bold text-accent">
            {lifetimeStats.averageSession}
          </p>
        </div>
      </div>
    </div>
  );
}