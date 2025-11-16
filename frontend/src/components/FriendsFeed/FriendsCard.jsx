import { useState, useEffect } from "react";
import api from "../../api";

export default function FriendsCard({ 
  onFriendClick
}) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getFriends();
        setFriends(data || []);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
        setError("Failed to load friends");
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="card">
      <h2 className="section-title">Friends</h2>

      {loading ? (
        <div className="text-center py-4 text-textLight/60">Loading friends...</div>
      ) : error ? (
        <div className="text-center py-4 text-danger">{error}</div>
      ) : friends.length === 0 ? (
        <div className="text-center py-4 text-textLight/60">No friends yet</div>
      ) : (
        <div className="space-y-3 mt-4 mb-4">
          {friends.map((friend) => (
            <div 
              key={friend.uid || friend.friend_uid}
              onClick={() => onFriendClick && onFriendClick(friend.friend_username)}
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
              <span>{friend.friend_username}</span>

              <span className="w-3 h-3 rounded-full bg-success ml-3"></span>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-lg">Add friend</button>
    </div>
  );
}