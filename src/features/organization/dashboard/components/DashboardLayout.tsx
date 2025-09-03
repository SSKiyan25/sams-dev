import { MembersStats } from "./MembersStats";
import { ShortcutLinks } from "./ShortcutLinks";
import { RecentMembers } from "./RecentMembers";
import { useEffect, useState } from "react";
import {
  getEvents,
  getOngoingEvents,
  getRecentUsers,
  getUpcomingEvents,
  getUsers,
} from "@/firebase";
import { Event } from "../types";
import { eventAttendance } from "../data";
import { Member } from "../../members/types";

// Type for Firebase event data
interface FirebaseEvent {
  id: number;
  name: string;
  date: string | Date;
  location: string;
  timeInStart?: string | null;
  timeInEnd?: string | null;
  timeOutStart?: string | null;
  timeOutEnd?: string | null;
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
  const [studentStats, setStudentStats] = useState({
    totalStudents: 0,
    totalAbsences: 0,
    attendanceRate: 0,
  });
  const [eventAttendance, setEventAttendance] = useState<Event[]>([]);
  const [users, setUsers] = useState<Member[]>([]);

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
    timeInStart: event.timeInStart || null,
    timeInEnd: event.timeInEnd || null,
    timeOutStart: event.timeOutStart || null,
    timeOutEnd: event.timeOutEnd || null,
    attendees: event.attendees || 0,
    majorEvent: event.isMajor || false,
    createdAt: event.createdAt,
    isDeleted: event.isDeleted || false,
    note: event.note || "",
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const [upcoming, ongoing, users, allEvents] = await Promise.all([
        getUpcomingEvents(),
        getOngoingEvents(),
        getUsers(),
        getEvents(),
      ]);

      const recentUser = await getRecentUsers();

      setUsers(
        recentUser.map((user: any) => ({
          ...user.member,
        })) as unknown as Member[]
      );

      // Map the Firebase data to our Event type
      const mappedUpcoming = upcoming.map((event: FirebaseEvent) =>
        mapToEvent(event, "upcoming")
      );

      const mappedOngoing = ongoing.map((event: FirebaseEvent) =>
        mapToEvent(event, "ongoing")
      );

      setUpcomingEvents(mappedUpcoming);
      setOngoingEvents(mappedOngoing);
      setEventAttendance(allEvents as unknown as Event[]);

      const totalStudents = users.length;
      const totalAbsences = allEvents.reduce((acc, event) => {
        const present = (event as unknown as Event).attendees || 0;
        const absent = totalStudents > present ? totalStudents - present : 0;
        return acc + absent;
      }, 0);
      const totalPossibleAttendees = allEvents.length * totalStudents;
      const totalAttendees = allEvents.reduce(
        (acc, event) => acc + ((event as unknown as Event).attendees || 0),
        0
      );
      const attendanceRate =
        totalPossibleAttendees > 0
          ? (totalAttendees / totalPossibleAttendees) * 100
          : 0;

      setStudentStats({
        totalStudents,
        totalAbsences,
        attendanceRate,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

      <MembersStats
        isLoading={isLoading}
        studentStats={studentStats}
        eventAttendance={eventAttendance}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShortcutLinks
          upcomingEvents={upcomingEvents}
          ongoingEvents={ongoingEvents}
          isLoading={isLoading}
        />
        <RecentMembers
          isLoading={isLoading}
          recentMembers={users.slice(0, 10)}
        />
      </div>
    </div>
  );
}
