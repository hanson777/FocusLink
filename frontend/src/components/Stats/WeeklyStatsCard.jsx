export default function WeeklyStatsCard({
  weeklyData = [30, 45, 12, 60, 90, 180, 15]
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxVal = Math.max(...weeklyData, 1);

  return (
    <div className="card">
      <h2 className="section-title">This Week</h2>

      <div className="flex items-end justify-between mt-6 space-x-2">
        {weeklyData.map((mins, i) => (
          <div key={i} className="flex flex-col items-center group">
            
            <div
              className="
                w-6 bg-primary rounded 
                transition-all duration-200
                hover:bg-primaryLight 
                hover:shadow-glow 
                hover:scale-110
              "
              style={{
                height: `${(mins / maxVal) * 120}px`
              }}
            ></div>

            <span className="text-xs mt-2 text-textLight">{days[i]}</span>

            <span className="
              absolute -mt-10 text-xs px-2 py-1 rounded 
              bg-surfaceLight text-text whitespace-nowrap 
              opacity-0 group-hover:opacity-100 transition 
              pointer-events-none
            ">
              {mins} mins
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}