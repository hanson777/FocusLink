import TodayStatsCard from "../components/Stats/TodayStatsCard";
import WeeklyStatsCard from "../components/Stats/WeeklyStatsCard";
import UserProfileCard from "../components/UserProfile/UserProfileCard";
import Navbar from "../components/Navbar/Navbar";

export default function Profile({ viewingUsername = null, onBack, onNavigate }) {
    // If viewingUsername is null, show current user's profile
    // Otherwise, show the friend's profile
    const isOwnProfile = viewingUsername === null;
    
    // For now, using default props from UserProfileCard
    // In a real app, you would fetch user data based on viewingUsername
    const profileData = {
        username: viewingUsername || "John", // Replace with actual current user
        status: "Focusing",
        lifetimeStats: {
            totalSessions: 42,
            totalMinutes: 2100,
            longestStreak: 6,
            averageSession: 38,
        }
    };

    return (
        <div className="min-h-screen bg-bg text-text">
            <main className="p-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-4">
                        <button
                            className="bg-surface text-textLight px-4 py-2 rounded-lg"
                            onClick={onBack}
                        >
                            Back
                        </button>
                    </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <UserProfileCard 
                                                viewingUsername={viewingUsername}
                                            />
                                            {isOwnProfile && (
                                                <div>
                                                    <TodayStatsCard />
                                                    <WeeklyStatsCard />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </main>
        </div>
    )
}