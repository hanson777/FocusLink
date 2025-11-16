export default function TimerCard({ timeLeft = "25:00", active = false, onStart, onEnd }) {
  return (
    <div className="card">
      <h2 className="section-title">Current Session</h2>

      <p className="text-6xl font-bold text-primary mt-4">{timeLeft}</p>

      {active ? (
        <button 
          onClick={onEnd}
          className="btn-accent mt-6 w-full"
        >
          End Session
        </button>
      ) : (
        <button 
          onClick={onStart}
          className="btn-primary mt-6 w-full"
        >
          Start Session
        </button>
      )}
    </div>
  );
}