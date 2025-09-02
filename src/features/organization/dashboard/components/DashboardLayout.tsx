import { MembersStats } from "./MembersStats";
import { ShortcutLinks } from "./ShortcutLinks";
import { RecentMembers } from "./RecentMembers";
import { useEffect, useState } from "react";
import { getOngoingEvents, getUpcomingEvents } from "@/firebase";
import { Event } from "../types";

// Type for Firebase event data
interface FirebaseEvent {
  id: number;
  name: string;
  date: string | Date;
  location: string;
  timeIn?: { start: string; end: string } | null;
  timeOut?: { start: string; end: string } | null;
  attendees?: number;
  isMajor?: boolean;
  createdAt?: any;
  isDeleted?: boolean;
  note?: string;
}

export function DashboardLayout() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to map Firebase events to our Event type
  const mapToEvent = (
    event: FirebaseEvent,
    status: "upcoming" | "ongoing"
  ): Event => ({
    id: String(event.id || ""), // Convert number to string
    name: event.name || "",
    date: event.date || new Date(),
    location: event.location || "",
    status,
    timeInStart: event.timeIn?.start || null,
    timeInEnd: event.timeIn?.end || null,
    timeOutStart: event.timeOut?.start || null,
    timeOutEnd: event.timeOut?.end || null,
    attendees: event.attendees || 0,
    majorEvent: event.isMajor || false,
    createdAt: event.createdAt,
    isDeleted: event.isDeleted || false,
    note: event.note || "",
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const [upcoming, ongoing] = await Promise.all([
        getUpcomingEvents(),
        getOngoingEvents(),
      ]);

      // Map the Firebase data to our Event type
      const mappedUpcoming = upcoming.map((event: FirebaseEvent) =>
        mapToEvent(event, "upcoming")
      );

      const mappedOngoing = ongoing.map((event: FirebaseEvent) =>
        mapToEvent(event, "ongoing")
      );

      setUpcomingEvents(mappedUpcoming);
      setOngoingEvents(mappedOngoing);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // console.log("Dashboard isLoading:", isLoading);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization&lsquo;s attendance and activity
        </p>
      </div>

      <MembersStats isLoading={isLoading} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShortcutLinks
          upcomingEvents={upcomingEvents}
          ongoingEvents={ongoingEvents}
          isLoading={isLoading}
        />
        <RecentMembers isLoading={isLoading} />
      </div>
    </div>
  );
}
