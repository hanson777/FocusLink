export default function DailyGoalCard({
  dailyMinutesGoal = 90,
  dailySessionsGoal = 3,
  minutesToday = 45,
  sessionsToday = 1,
  onEditGoals
}) {
  const minutesPercent = Math.min((minutesToday / dailyMinutesGoal) * 100, 100);
  const sessionsPercent = Math.min((sessionsToday / dailySessionsGoal) * 100, 100);

  return (
    <div className="card">
      <h2 className="section-title">Daily Goals</h2>

      <div className="space-y-5 mt-4">

        <div>
          <div className="flex justify-between text-sm text-textLight/60 mb-1">
            <span>Minutes</span>
            <span>{minutesToday}/{dailyMinutesGoal}</span>
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
            <span>{sessionsToday}/{dailySessionsGoal}</span>
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