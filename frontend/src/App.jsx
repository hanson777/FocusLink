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
        <div className="
          grid gap-10 
          grid-cols-1 
          md:grid-cols-2 
          xl:grid-cols-3 
          2xl:grid-cols-5 
          justify-items-center
        ">

          <UserProfileCard />

          <QuickActionsCard />

          <DailyGoalCard
            dailyMinutesGoal={90}
            dailySessionsGoal={3}
            minutesToday={42}
            sessionsToday={1}
          />

          <TimerCard
            timeLeft="25:00"
            active={false}
            onStart={() => console.log("Start")}
            onEnd={() => console.log("End")}
          />

          <TodayStatsCard />

          <WeeklyStatsCard />

          <FriendsCard />

        </div>
      </main>

    </div>
  );
}