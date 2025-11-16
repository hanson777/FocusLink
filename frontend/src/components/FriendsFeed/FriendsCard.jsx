import { useState, useEffect, useRef } from "react";
import api from "../../api";

export default function FriendsCard({ onFriendClick }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

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
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  async function handleSearchUsers(query) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await api.searchUsers(query.trim());
      setSearchResults(results || []);
    } catch (err) {
      console.error("Search users failed:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchChange(e) {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchUsers(query);
    }, 300);
  }

  async function handleAddFriend(user) {
    try {
      await api.addFriend({
        friend_uid: user.uid,
        friend_username: user.username,
      });
      setSearchQuery("");
      setSearchResults([]);
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
        <div className="mt-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-surfaceLight border border-surface rounded-lg px-3 py-2 text-textLight placeholder:text-textLight/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight/60 text-sm">
                Searching...
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-surface rounded-lg bg-surfaceLight">
              {searchResults.map((user) => {
                // Check if user is already a friend
                const isAlreadyFriend = friends.some(
                  (f) => f.friend_uid === user.uid
                );

                return (
                  <div
                    key={user.uid}
                    className="p-3 border-b border-surface last:border-b-0 hover:bg-surface transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-textLight">
                        {user.username}
                      </div>
                      {(user.first_name || user.last_name) && (
                        <div className="text-sm text-textLight/60">
                          {user.first_name} {user.last_name}
                        </div>
                      )}
                    </div>
                    {isAlreadyFriend ? (
                      <span className="text-sm text-textLight/40">
                        Already added
                      </span>
                    ) : (
                      <button
                        className="btn text-sm px-3 py-1"
                        onClick={() => handleAddFriend(user)}
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery.trim() && !searching && searchResults.length === 0 && (
            <div className="text-center text-textLight/60 py-4 text-sm">
              No users found
            </div>
          )}

          <button
            type="button"
            className="btn w-full bg-transparent border border-surfaceLight text-textLight"
            onClick={() => {
              setAdding(false);
              setSearchQuery("");
              setSearchResults([]);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}