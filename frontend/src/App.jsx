import { useState, useEffect } from "react";
import TimerCard from "./components/Timer/TimerCard";
import TodayStatsCard from "./components/Stats/TodayStatsCard";
import WeeklyStatsCard from "./components/Stats/WeeklyStatsCard";
import FriendsCard from "./components/FriendsFeed/FriendsCard";
import UserProfileCard from "./components/UserProfile/UserProfileCard";
import Navbar from "./components/Navbar/Navbar";
import ProfilePage from "./pages/Profile";
import AuthPage from "./pages/Auth";
import DailyGoalCard from "./components/Goals/DailyGoalCard";
import { getCurrentUser, clearAuthData } from "./api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [viewingUsername, setViewingUsername] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    const token = localStorage.getItem("authToken");
    
    if (token && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
  }, []);

  const handleViewProfile = (username = null) => {
    setViewingUsername(username);
    setPage("profile");
  };

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
    setPage("home");
    setViewingUsername(null);
  };

  const handleBack = () => {
    setPage("home");
    setViewingUsername(null);
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">

      <Navbar onNavigate={(p) => setPage(p)} onLogout={handleLogout} />

      {page === "home" ? (
        <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">

          <div className="flex flex-col gap-6 sm:gap-8 min-h-full">
            <UserProfileCard onClick={() => handleViewProfile(null)} />
            <FriendsCard onFriendClick={(friendUsername) => handleViewProfile(friendUsername)} />
          </div>

          <div className="flex flex-col items-center min-h-full mt-6 md:mt-0">
            <TimerCard timeLeft="25:00" active={false} />
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 min-h-full">
            <WeeklyStatsCard />
            <TodayStatsCard />
            <DailyGoalCard />
          </div>

          </div>
        </main>
      ) : page === "profile" ? (
        <ProfilePage 
          viewingUsername={viewingUsername}
          onBack={handleBack} 
          onNavigate={(p) => setPage(p)} 
        />
      ) : null}

    </div>
  );
}