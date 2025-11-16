import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "../../api";
import api from "../../api";

export default function DailyGoalCard() {
  const [goals, setGoals] = useState({
    uid: null,
    minutes: 0,
    sessions: 0,
  });

  const [editing, setEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState("0");
  const [editSessions, setEditSessions] = useState("0");
  const [todayStats, setTodayStats] = useState({
    minutes: 0,
    sessions: 0,
  });

  useEffect(() => {
    loadGoals();
    loadTodayStats();
    
    // Refresh stats every 30 seconds to update in real-time
    const interval = setInterval(loadTodayStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadGoals() {
    try {
      const list = await apiGet("/daily-goals/");

      // Validate response is an array
      if (!Array.isArray(list)) {
        console.warn("Expected array from /daily-goals/, got:", typeof list);
        setGoals({
          uid: null,
          minutes: 90,
          sessions: 3,
        });
        return;
      }

      // If the user has no goals yet, create them
      if (list.length === 0) {
        try {
          const created = await apiPost("/daily-goals/", {
            minutes_goal: 90,
            session_goal: 3,
          });

          setGoals({
            uid: created.uid,
            minutes: created.minutes_goal || 90,
            sessions: created.session_goal || 3,
          });
          return;
        } catch (createError) {
          console.error("Failed to create default goals:", createError);
          // Set default values if creation fails
          setGoals({
            uid: null,
            minutes: 90,
            sessions: 3,
          });
          return;
        }
      }

      // Get the first goal (API returns array per docs)
      const g = list[0];
      if (!g || typeof g !== "object") {
        console.warn("Invalid goal object:", g);
        setGoals({
          uid: null,
          minutes: 90,
          sessions: 3,
        });
        return;
      }

      setGoals({
        uid: g.uid,
        minutes: g.minutes_goal ?? 90,
        sessions: g.session_goal ?? 3,
      });
    } catch (err) {
      console.error("Failed to load goals:", err);
      // Set default values if API call fails (e.g., CORS error)
      setGoals({
        uid: null,
        minutes: 90,
        sessions: 3,
      });
    }
  }

  async function updateGoals(newGoals) {
    try {
      const payload = {
        minutes_goal: newGoals.minutes,
        session_goal: newGoals.sessions,
      };

      // If no uid, create new goal instead of updating
      if (!goals.uid) {
        const created = await apiPost("/daily-goals/", payload);
        setGoals({
          uid: created.uid,
          minutes: created.minutes_goal,
          sessions: created.session_goal,
        });
      } else {
        const data = await apiPut(`/daily-goals/${goals.uid}`, payload);
        setGoals({
          uid: data.uid,
          minutes: data.minutes_goal,
          sessions: data.session_goal,
        });
      }

      setEditing(false);
      // Reload today's stats after updating goals
      await loadTodayStats();
    } catch (err) {
      console.error("Failed to update goals:", err);
      alert("Failed to save goals. Please try again.");
    }
  }

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

  function startEditing() {
    setEditMinutes(String(goals.minutes));
    setEditSessions(String(goals.sessions));
    setEditing(true);
  }

  // Use real stats from study sessions
  const minutesToday = todayStats.minutes;
  const sessionsToday = todayStats.sessions;

  const minutesPercent = goals.minutes
    ? Math.min((minutesToday / goals.minutes) * 100, 100)
    : 0;

  const sessionsPercent = goals.sessions
    ? Math.min((sessionsToday / goals.sessions) * 100, 100)
    : 0;

  return (
    <div className="card">
      <h2 className="section-title">Daily Goals</h2>

      <div className="space-y-5 mt-4">
        {/* Minutes */}
        <div>
          <div className="flex justify-between text-sm text-textLight/60 mb-1">
            <span>Minutes</span>
            <span>
              {minutesToday}/{goals.minutes}
            </span>
          </div>

          <div className="w-full h-3 bg-surfaceLight rounded-lg overflow-hidden">
            <div
              className="h-full bg-primary rounded-lg transition-all duration-300"
              style={{ width: `${minutesPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Sessions */}
        <div>
          <div className="flex justify-between text-sm text-textLight/60 mb-1">
            <span>Sessions</span>
            <span>
              {sessionsToday}/{goals.sessions}
            </span>
          </div>

          <div className="w-full h-3 bg-surfaceLight rounded-lg overflow-hidden">
            <div
              className="h-full bg-accent rounded-lg transition-all duration-300"
              style={{ width: `${sessionsPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Editing UI */}
        {!editing ? (
          <button onClick={startEditing} className="btn btn-lg mt-4">
            Edit Goals
          </button>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();

              const minutes = Number(editMinutes);
              const sessions = Number(editSessions);

              if (!minutes || !sessions) return;

              updateGoals({ minutes, sessions });
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-textLight/70 flex-1">
                Minutes goal
              </label>
              <input
                type="number"
                min="1"
                className="w-24 bg-surfaceLight border border-surface rounded-lg px-2 py-1 text-sm text-textLight focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-textLight/70 flex-1">
                Sessions goal
              </label>
              <input
                type="number"
                min="1"
                className="w-24 bg-surfaceLight border border-surface rounded-lg px-2 py-1 text-sm text-textLight focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={editSessions}
                onChange={(e) => setEditSessions(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn btn-lg flex-1">
                Save
              </button>

              <button
                type="button"
                className="btn btn-lg flex-1 bg-transparent border border-surfaceLight text-textLight"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}