import TimerCard from "./components/Timer/TimerCard";
import TodayStatsCard from "./components/Stats/TodayStatsCard";
import WeeklyStatsCard from "./components/Stats/WeeklyStatsCard";
import FriendsCard from "./components/FriendsFeed/FriendsCard";
import UserProfileCard from "./components/UserProfile/UserProfileCard";
import Navbar from "./components/Navbar/Navbar";
import DailyGoalCard from "./components/Goals/DailyGoalCard";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      
      <Navbar />

      <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">

          <div className="flex flex-col gap-6 sm:gap-8">
            <UserProfileCard />
            <FriendsCard />
          </div>

          <div className="flex flex-col justify-center items-center min-h-full md:min-h-0 mt-6 md:mt-0">
            <TimerCard timeLeft="25:00" active={false} />
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
            <WeeklyStatsCard />
            <TodayStatsCard />
            <DailyGoalCard />
          </div>

        </div>
      </main>

    </div>
  );
}
