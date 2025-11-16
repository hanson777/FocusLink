export default function QuickActionsCard({
  onStart30 = () => {},
  onStart60 = () => {},
  onAddFriend = () => {},
  onStartCustom = () => {}
}) {
  return (
    <div className="card">
      <h2 className="section-title">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-4 mt-4">

        <button
          onClick={onStart30}
          className="
            bg-primary/20 text-primary 
            hover:bg-primary/30
            p-3 rounded-lg text-sm font-semibold 
            transition 
          "
        >
          30 min
        </button>

        <button
          onClick={onStart60}
          className="
            bg-primary/20 text-primary 
            hover:bg-primary/30
            p-3 rounded-lg text-sm font-semibold 
            transition 
          "
        >
          60 min
        </button>

        <button
          onClick={onStartCustom}
          className="
            bg-primary/20 text-primary 
            hover:bg-primary/30
            p-3 rounded-lg text-sm font-semibold 
            transition 
          "
        >
          Custom
        </button>

        <button
          onClick={onAddFriend}
          className="
            bg-accent/20 text-accent 
            hover:bg-accent/30 
            p-3 rounded-lg text-sm font-semibold 
            transition 
          "
        >
          Add Friend
        </button>

      </div>
    </div>
  );
}