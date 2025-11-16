import TimerCard from "./components/Timer/TimerCard";
import TodayStatsCard from "./components/Stats/TodayStatsCard";
import WeeklyStatsCard from "./components/Stats/WeeklyStatsCard";
import FriendsCard from "./components/FriendsFeed/FriendsCard";
import UserProfileCard from "./components/UserProfile/UserProfileCard";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text p-10">
      <h1 className="text-4xl font-bold text-textLight mb-8">Dashboard</h1>

      <div className="flex justify-center gap-12">

        <div className="max-w-md">
          <UserProfileCard />
        </div>

        <div className="max-w-md">
          <TimerCard
            timeLeft="25:00"
            active={false}
            onStart={() => console.log("Start")}
            onEnd={() => console.log("End")}
          />
        </div>

        <div className="max-w-md">
          <TodayStatsCard />
        </div>

        <div className="max-w-md">
          <WeeklyStatsCard />
        </div>

        <div className="max-w-md">
          <FriendsCard />
        </div>
        
      </div>

    </div>
  );
}