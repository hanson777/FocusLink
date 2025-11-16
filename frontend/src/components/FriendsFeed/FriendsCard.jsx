import { useState, useEffect } from "react";
import api from "../../api";

export default function FriendsCard({ onFriendClick }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newFriendUid, setNewFriendUid] = useState("");

  async function loadFriends() {
    try {
      setLoading(true);
      const data = await api.getFriends();
      setFriends(data || []);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError("Failed to load friends");
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFriends();
  }, []);

  async function handleAddFriend(e) {
    e.preventDefault();
    if (!newFriendUid.trim()) return;

    try {
      await api.addFriend({
            friend_uid: newFriendUid.trim(),
            friend_username: "Unknown"  // or fetch real user
        });
      setNewFriendUid("");
      setAdding(false);
      await loadFriends();
    } catch (err) {
      console.error("Add friend failed:", err);
      alert("Failed to add friend.");
    }
  }

  async function handleRemoveFriend(friend_uid) {
    if (!confirm("Remove this friend?")) return;

    try {
      await api.removeFriend(friend_uid);
      await loadFriends();
    } catch (err) {
      console.error("Remove friend failed:", err);
      alert("Failed to remove friend.");
    }
  }

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
              key={friend.uid}
              className="
                bg-surfaceLight text-textLight
                p-3 px-4 rounded-lg 
                flex items-center justify-between 
                border border-surface 
                hover:bg-surface transition-colors
              "
            >
              <div
                className="cursor-pointer"
                onClick={() =>
                  onFriendClick && onFriendClick(friend.friend_username)
                }
              >
                {friend.friend_username}
              </div>

              <button
                className="text-danger text-sm"
                onClick={() => handleRemoveFriend(friend.friend_uid)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {!adding ? (
        <button className="btn btn-lg" onClick={() => setAdding(true)}>
          Add friend
        </button>
      ) : (
        <form onSubmit={handleAddFriend} className="mt-4 space-y-3">
          <input
            type="text"
            className="w-full bg-surfaceLight border border-surface rounded-lg px-3 py-2"
            placeholder="Enter friend's UID"
            value={newFriendUid}
            onChange={(e) => setNewFriendUid(e.target.value)}
          />

          <div className="flex gap-3">
            <button type="submit" className="btn flex-1">
              Add
            </button>
            <button
              type="button"
              className="btn flex-1 bg-transparent border border-surfaceLight"
              onClick={() => setAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}