import { useState } from "react";
import TimerCard from "./components/Timer/TimerCard";
import TodayStatsCard from "./components/Stats/TodayStatsCard";
import WeeklyStatsCard from "./components/Stats/WeeklyStatsCard";
import FriendsCard from "./components/FriendsFeed/FriendsCard";
import UserProfileCard from "./components/UserProfile/UserProfileCard";
import Navbar from "./components/Navbar/Navbar";
import ProfilePage from "./pages/Profile";
import DailyGoalCard from "./components/Goals/DailyGoalCard";
import QuickActionsCard from "./components/QuickActions/QuickActionsCard";

export default function App() {
  const [page, setPage] = useState("home");
  const [viewingUsername, setViewingUsername] = useState(null);

  const handleViewProfile = (username = null) => {
    setViewingUsername(username);
    setPage("profile");
  };

  const handleBack = () => {
    setPage("home");
    setViewingUsername(null);
  };

  return (
    <div className="min-h-screen bg-bg text-text">

      <Navbar onNavigate={(p) => setPage(p)} />

      {page === "home" ? (
        <main className="p-10">
      <div className="max-w-[1400px] mx-auto">

      <div className="flex flex-wrap gap-10 justify-items-center">
          
        <UserProfileCard className="w-1/3" onClick={() => handleViewProfile(null)} />
        <DailyGoalCard className="w-1/3" />

        <TimerCard 
        timeLeft="25:00" 
        active={false} 
        onStart={() => console.log("start")}
        onEnd={() => console.log("end")}
        />
        <TodayStatsCard />
        <WeeklyStatsCard />

        <FriendsCard onFriendClick={(friendUsername) => handleViewProfile(friendUsername)} />

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