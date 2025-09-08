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
    totalEvents: 0,
    overallAttendanceRate: 0,
    averageAttendance: 0,
    totalAttendances: 0,
    peakAttendance: 0,
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

    // Fetch all required data in parallel
    const [upcoming, ongoing, users, allEvents, recentUser] = await Promise.all(
      [
        getUpcomingEvents(),
        getOngoingEvents(),
        getUsers(),
        getEvents(),
        getRecentUsers(),
      ]
    );

    // --- Process User Data ---
    setUsers(
      recentUser.map((user: any) => ({
        ...user.member,
      })) as unknown as Member[]
    );

    // --- Process Event Data ---
    const mappedUpcoming = upcoming.map((event: FirebaseEvent) =>
      mapToEvent(event, "upcoming")
    );
    const mappedOngoing = ongoing.map((event: FirebaseEvent) =>
      mapToEvent(event, "ongoing")
    );
    setUpcomingEvents(mappedUpcoming);
    setOngoingEvents(mappedOngoing);
    setEventAttendance(allEvents as unknown as Event[]);

    // --- NEW: Advanced Statistics Calculation ---

    const totalStudents = users.length;
    const totalEvents = allEvents.length;

    // Handle case with no events or students to avoid division by zero
    if (totalEvents === 0 || totalStudents === 0) {
      setStudentStats({
        totalStudents: totalStudents,
        totalEvents: 0,
        overallAttendanceRate: 0,
        averageAttendance: 0,
        totalAttendances: 0,
        peakAttendance: 0,
      });
      setIsLoading(false);
      return; // Exit early
    }

    // 1. Get a simple array of attendee counts for each event
    const eventAttendances = allEvents.map(
      (event) => (event as unknown as Event).attendees || 0
    );

    // 2. Calculate Total Attendances (sum of all check-ins across all events)
    const totalAttendances = eventAttendances.reduce(
      (sum, count) => sum + count,
      0
    );

    // 3. Calculate the maximum possible attendances
    const totalPossibleAttendances = totalEvents * totalStudents;

    // 4. Calculate Overall Attendance Rate
    const overallAttendanceRate =
      (totalAttendances / totalPossibleAttendances) * 100;

    // 5. Calculate Average Attendance Per Event
    const averageAttendance = totalAttendances / totalEvents;

    // 6. Find the Peak (highest) Attendance for a single event
    const peakAttendance = Math.max(...eventAttendances);

    // --- Set the new, improved state ---
    // It's recommended to create a new state object to hold all these stats
    setStudentStats({
      totalStudents,
      totalEvents,
      totalAttendances,
      // Use toFixed(1) to show one decimal place for percentages and averages
      overallAttendanceRate: parseFloat(overallAttendanceRate.toFixed(1)),
      averageAttendance: parseFloat(averageAttendance.toFixed(1)),
      peakAttendance,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
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
