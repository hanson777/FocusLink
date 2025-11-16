export default function TodayStatsCard({
  sessionsToday = 0,
  minutesToday = 0
}) {
  return (
    <div className="card">
      <h2 className="section-title">Today's Stats</h2>

      <div className="grid grid-cols-2 gap-4 mt-4">

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Sessions</p>
          <p className="text-3xl font-bold text-primary">
            {sessionsToday}
          </p>
        </div>

        <div className="bg-surfaceLight p-3 rounded-lg">
          <p className="text-sm text-textLight/60">Minutes</p>
          <p className="text-3xl font-bold text-accent">
            {minutesToday}
          </p>
        </div>

      </div>
    </div>
  );
}

