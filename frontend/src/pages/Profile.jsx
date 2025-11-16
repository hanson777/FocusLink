import TodayStatsCard from "../components/Stats/TodayStatsCard";
import WeeklyStatsCard from "../components/Stats/WeeklyStatsCard";
import UserProfileCard from "../components/UserProfile/UserProfileCard";
import Navbar from "../components/Navbar/Navbar";
// unused imports removed

export default function Profile({ onBack, onNavigate }) {
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
                                            <UserProfileCard />
                                            <div>
                                                <TodayStatsCard />
                                                <WeeklyStatsCard />
                                            </div>
                                        </div>
                                    </div>
                                </main>
        </div>
    )
}