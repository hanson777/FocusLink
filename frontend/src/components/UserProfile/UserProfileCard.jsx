import { useEffect, useState } from "react";
import { apiGet } from "../../api";

export default function UserProfileCard({
  username = "John",
  lifetimeStats = {
    totalSessions: 3,
    totalMinutes: 142,
    longestStreak: 2,
    averageSession: 38,
  },
  onClick,
  className,
}) {
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
  fetchStatus();
  const interval = setInterval(fetchStatus, 5000);
  return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const data = await apiGet("/user-status/me");
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
          {username[0].toUpperCase()}
        </div>

        <div>
          <p className="text-xl font-semibold text-textLight">{username}</p>

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