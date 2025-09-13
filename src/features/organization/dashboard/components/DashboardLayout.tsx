/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  totalAttendeesForAllEvent,
} from "@/firebase";
import { Event } from "../types";
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
    totalAbsences: 0,
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
      const [upcoming, ongoing, users, allEvents, recentUser] =
        await Promise.all([
          getUpcomingEvents(),
          getOngoingEvents(),
          getUsers(),
          getEvents(),
          getRecentUsers(),
        ]);

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
          totalEvents: totalEvents,
          overallAttendanceRate: 0,
          averageAttendance: 0,
          totalAttendances: 0,
          totalAbsences: 0,
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
      const totalAttendances = await totalAttendeesForAllEvent();

      // 3. Calculate the maximum possible attendances
      const totalPossibleAttendances = totalEvents * totalStudents;

      // 4. Calculate Overall Attendance Rate
      const overallAttendanceRate =
        (totalAttendances / totalPossibleAttendances) * 100;

      // 5. Calculate Average Attendance Per Event
      const averageAttendance = totalAttendances / totalEvents;

      // 6. Find the Peak (highest) Attendance for a single event
      const peakAttendance = Math.max(...eventAttendances);

      // 7. Calculate Total Absences
      const totalAbsences = totalPossibleAttendances - totalAttendances;

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
        totalAbsences,
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
            studentStats={studentStats}
            eventAttendance={eventAttendance}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-400">
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
      </div>
    </div>
  );
}
