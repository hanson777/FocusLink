import { useEffect, useState } from "react";
import api from "../../api";

export default function TodayStatsCard() {
  const [todayStats, setTodayStats] = useState({
    minutes: 0,
    sessions: 0,
  });

  useEffect(() => {
    loadTodayStats();
    
    // Refresh stats every 30 seconds to update in real-time
    const interval = setInterval(loadTodayStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadTodayStats() {
    try {
      const sessions = await api.getStudySessions();
      
      if (!Array.isArray(sessions)) {
        console.warn("Expected array from /study-sessions/, got:", typeof sessions);
        setTodayStats({ minutes: 0, sessions: 0 });
        return;
      }

      // Get today's date range (start and end of day in UTC)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Filter sessions for today
      const todaySessions = sessions.filter((session) => {
        if (!session.start_time) return false;
        const sessionDate = new Date(session.start_time);
        return sessionDate >= todayStart && sessionDate < todayEnd;
      });

      // Calculate total minutes from start_time and end_time
      // The API doesn't provide studying_duration, so we calculate it
      const totalSeconds = todaySessions.reduce((sum, session) => {
        if (!session.start_time || !session.end_time) {
          return sum; // Skip sessions without both times
        }
        
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const durationMs = end - start;
        const durationSeconds = Math.floor(durationMs / 1000);
        
        return sum + durationSeconds;
      }, 0);

      const totalMinutes = Math.floor(totalSeconds / 60);
      const sessionCount = todaySessions.length;

      setTodayStats({
        minutes: totalMinutes,
        sessions: sessionCount,
      });
    } catch (err) {
      console.error("Failed to load today's stats:", err);
      setTodayStats({ minutes: 0, sessions: 0 });
    }
  }

  return (
    <div className="card">
      <h2 className="section-title">Today's Stats</h2>

      <div className="grid grid-cols-2 gap-4 mt-4">

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Sessions</p>
          <p className="text-3xl font-bold text-primary">
            {todayStats.sessions}
          </p>
        </div>

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Minutes</p>
          <p className="text-3xl font-bold text-accent">
            {todayStats.minutes}
          </p>
        </div>

      </div>
    </div>
  );
}

