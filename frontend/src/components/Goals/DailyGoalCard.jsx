import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../../api";

export default function DailyGoalCard() {
  const [goals, setGoals] = useState({ minutes: 90, sessions: 3 });
  const [editing, setEditing] = useState(false);

  function onEditGoals() {
    setEditing(true);
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    const data = await apiGet("/api/goals");
    setGoals(data);
  }

  async function updateGoals(newGoals) {
    const data = await apiPut("/api/goals", newGoals);
    setGoals(data);
  }

  const minutesToday = 40;
  const sessionsToday = 1;

  const minutesPercent = Math.min((minutesToday / goals.minutes) * 100, 100);
  const sessionsPercent = Math.min((sessionsToday / goals.sessions) * 100, 100);

  return (
    <div className="card">
      <h2 className="section-title">Daily Goals</h2>

      <div className="space-y-5 mt-4">

        <div>
          <div className="flex justify-between text-sm text-textLight/60 mb-1">
            <span>Minutes</span>
            <span>{minutesToday}/{goals.minutes}</span>
          </div>

          <div className="w-full h-3 bg-surfaceLight rounded-lg overflow-hidden">
            <div
              className="h-full bg-primary rounded-lg transition-all duration-300"
              style={{ width: `${minutesPercent}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-textLight/60 mb-1">
            <span>Sessions</span>
            <span>{sessionsToday}/{goals.sessions}</span>
          </div>

          <div className="w-full h-3 bg-surfaceLight rounded-lg overflow-hidden">
            <div
              className="h-full bg-accent rounded-lg transition-all duration-300"
              style={{ width: `${sessionsPercent}%` }}
            ></div>
          </div>
        </div>

        <button
            onClick={onEditGoals}
            className="btn btn-lg mt-4"
        >
            Edit Goals
        </button>


      </div>
    </div>
  );
}