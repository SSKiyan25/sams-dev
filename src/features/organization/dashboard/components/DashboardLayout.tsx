import { MembersStats } from "./MembersStats";
import { ShortcutLinks } from "./ShortcutLinks";
import { RecentMembers } from "./RecentMembers";
import { useEffect, useState } from "react";
import { getOngoingEvents, getUpcomingEvents } from "@/firebase";

export function DashboardLayout() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    const [upcoming, ongoing] = await Promise.all([
      getUpcomingEvents(),
      getOngoingEvents(),
    ]);
    setUpcomingEvents(upcoming as unknown as Event[]);
    setOngoingEvents(ongoing as unknown as Event[]);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization&lsquo;s attendance and activity
        </p>
      </div>

      <MembersStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShortcutLinks
          upcomingEvents={upcomingEvents}
          ongoingEvents={ongoingEvents}
        />
        <RecentMembers />
      </div>
    </div>
  );
}
