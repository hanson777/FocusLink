export default function FriendsCard({ 
  friends = ["John", "Jane", "Jack", "Amy"]
}) {
  return (
    <div className="card">
      <h2 className="section-title">Friends</h2>

      <div className="space-y-3 mt-4">
        {friends.map((friend, i) => (
          <div 
            key={i}
            className="
              bg-surfaceLight 
              text-textLight
              p-3 px-4
              rounded-lg 
              flex items-center justify-between 
              border border-surface 
              hover:bg-surface transition-colors
              cursor-pointer
            "
          >
            <span>{friend}</span>

            <span className="w-3 h-3 rounded-full bg-success ml-3"></span>
          </div>
        ))}
      </div>
    </div>
  );
}