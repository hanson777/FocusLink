import TimerCard from "./components/Timer/TimerCard";
import TodayStatsCard from "./components/Stats/TodayStatsCard";
import WeeklyStatsCard from "./components/Stats/WeeklyStatsCard";
import FriendsCard from "./components/FriendsFeed/FriendsCard";
import UserProfileCard from "./components/UserProfile/UserProfileCard";
import Navbar from "./components/Navbar/Navbar";
import DailyGoalCard from "./components/Goals/DailyGoalCard";
import QuickActionsCard from "./components/QuickActions/QuickActionsCard";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">

      <Navbar />

    <main className="p-10">
      <div className="max-w-[1400px] mx-auto">

      <div className="flex flex-wrap gap-10 justify-items-center">
          
        <UserProfileCard />
        <DailyGoalCard />

        <TimerCard 
        timeLeft="25:00" 
        active={false} 
        onStart={() => console.log("start")}
        onEnd={() => console.log("end")}
        />
        <TodayStatsCard />
        <WeeklyStatsCard />

        <FriendsCard />

        </div>

      </div>
    </main>

    </div>
  );
}