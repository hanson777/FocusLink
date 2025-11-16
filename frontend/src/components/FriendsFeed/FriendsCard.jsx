export default function FriendsCard({ 
  friends = ["John", "Jane", "Jack", "Amy"],
  onFriendClick
}) {
  return (
    <div className="card">
      <h2 className="section-title">Friends</h2>

      <div className="space-y-3 mt-4 mb-4">
        {friends.map((friend, i) => (
          <div 
            key={i}
            onClick={() => onFriendClick && onFriendClick(friend)}
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

    <button className="btn btn-lg">Add friend</button>
      
    </div>
  );
}