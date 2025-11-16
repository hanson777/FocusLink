import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "../../api";

export default function DailyGoalCard() {
  const [goals, setGoals] = useState({
    uid: null,
    minutes: 0,
    sessions: 0,
  });

  const [editing, setEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState("0");
  const [editSessions, setEditSessions] = useState("0");

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const list = await apiGet("/daily-goals/");

      // If the user has no goals yet, create them
      if (!list || list.length === 0) {
        try {
          const created = await apiPost("/daily-goals/", {
            minutes_goal: 90,
            session_goal: 3,
          });

          setGoals({
            uid: created.uid,
            minutes: created.minutes_goal,
            sessions: created.session_goal,
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

      const g = list[0];
      setGoals({
        uid: g.uid,
        minutes: g.minutes_goal,
        sessions: g.session_goal,
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
    } catch (err) {
      console.error("Failed to update goals:", err);
      alert("Failed to save goals. Please try again.");
    }
  }

  function startEditing() {
    setEditMinutes(String(goals.minutes));
    setEditSessions(String(goals.sessions));
    setEditing(true);
  }

  // Example stats — replace with real later
  const minutesToday = 40;
  const sessionsToday = 1;

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