import { MembersStats } from "./MembersStats";
import { ShortcutLinks } from "./ShortcutLinks";
import { RecentMembers } from "./RecentMembers";
import { MobileDashboard } from "./MobileDashboard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardLayout() {
  const { stats, upcomingEvents, ongoingEvents, recentMembers, isLoading } =
    useDashboard();

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileDashboard
        isLoading={isLoading}
        studentStats={stats}
        eventAttendance={[...upcomingEvents, ...ongoingEvents]}
        upcomingEvents={upcomingEvents}
        ongoingEvents={ongoingEvents}
        recentMembers={recentMembers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-primary/5 to-primary/10 p-8 md:p-12 border border-primary/20 shadow-xl backdrop-blur-sm animate-fade-in-up animation-delay-200">
            {/* Enhanced background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-full -ml-16 -mb-16"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full opacity-30"></div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    Organization Dashboard
                  </h1>
                </div>
              </div>

              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
                Overview of your organization&apos;s attendance and activity
              </p>
            </div>
          </div>

          <MembersStats
            isLoading={isLoading}
            studentStats={stats}
            eventAttendance={[...upcomingEvents, ...ongoingEvents]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-400">
            <ShortcutLinks
              upcomingEvents={upcomingEvents}
              ongoingEvents={ongoingEvents}
              isLoading={isLoading}
            />
            <RecentMembers
              isLoading={isLoading}
              recentMembers={recentMembers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
