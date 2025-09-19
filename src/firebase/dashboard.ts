/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { Event } from "@/features/organization/dashboard/types";
import { Member } from "@/features/organization/members/types";
import { getCurrentUserData } from "./users";
import { cacheService, CACHE_DURATIONS } from "@/services/cacheService";
import { determineEventStatus } from "@/utils/eventStatusUtils";

// Helper to transform event data from Firestore to our Event type
const transformEventData = (doc: any): Event => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data.date?.toDate ? data.date.toDate() : data.date,
  } as Event;
};

/**
 * Gets a count of total attendees across all events for the current user's context
 * Uses an efficient single aggregation query instead of fetching all events
 */
export const getDashboardAttendeeCount = async (): Promise<number> => {
  try {
    // Use cache with a specific key for this dashboard metric
    const cacheKey = `dashboard:total-attendees-count`;

    return await cacheService.getOrFetch<number>(
      cacheKey,
      async () => {
        const currentUser = (await getCurrentUserData()) as unknown as Member;
        if (!currentUser) return 0;

        // Determine if we're querying by faculty or program
        const queryField = currentUser.facultyId ? "facultyId" : "programId";
        const queryValue = currentUser.facultyId || currentUser.programId;

        if (!queryValue) {
          console.error("User has neither facultyId nor programId.");
          return 0;
        }

        // Create a query to get events for this faculty/program
        const eventsQuery = query(
          collection(db, "events"),
          where("isDeleted", "==", false),
          where(queryField, "==", queryValue)
        );

        // Use getCountFromServer to avoid fetching document data
        const countSnapshot = await getCountFromServer(eventsQuery);
        const totalEvents = countSnapshot.data().count;

        // If there are no events, return 0 early
        if (totalEvents === 0) return 0;

        // Now fetch minimal data to sum attendees
        const eventsSnapshot = await getDocs(eventsQuery);

        // Sum the attendees field from each event
        let totalAttendees = 0;
        eventsSnapshot.forEach((doc) => {
          const eventData = doc.data();
          totalAttendees += eventData.attendees || 0;
        });

        return totalAttendees;
      },
      CACHE_DURATIONS.EVENTS // Cache for 15 minutes
    );
  } catch (error) {
    console.error("Error getting dashboard attendee count:", error);
    return 0;
  }
};

/**
 * Gets dashboard-specific upcoming events with minimal fields
 * Optimized to fetch only what's needed for the dashboard
 */
export const getDashboardUpcomingEvents = async (
  count = 5
): Promise<Event[]> => {
  try {
    // Use cache with a specific key for this dashboard section
    const cacheKey = `dashboard:upcoming-events:${count}`;

    return await cacheService.getOrFetch<Event[]>(
      cacheKey,
      async () => {
        const currentUser = (await getCurrentUserData()) as unknown as Member;
        if (!currentUser) return [];

        // Determine if we're querying by faculty or program
        const queryField = currentUser.facultyId ? "facultyId" : "programId";
        const queryValue = currentUser.facultyId || currentUser.programId;

        if (!queryValue) {
          console.error("User has neither facultyId nor programId.");
          return [];
        }

        // Create a query for upcoming events only
        // Filter by date greater than today to avoid status recalculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const eventsQuery = query(
          collection(db, "events"),
          where("isDeleted", "==", false),
          where(queryField, "==", queryValue),
          where("date", ">=", Timestamp.fromDate(today)),
          orderBy("date", "asc"),
          limit(count)
        );

        const querySnapshot = await getDocs(eventsQuery);

        // Transform to our Event type
        return querySnapshot.docs.map(transformEventData);
      },
      CACHE_DURATIONS.EVENTS // Cache for 15 minutes
    );
  } catch (error) {
    console.error("Error getting dashboard upcoming events:", error);
    return [];
  }
};

/**
 * Gets dashboard-specific ongoing events with minimal fields
 * Optimized to fetch only what's needed for the dashboard
 */
export const getDashboardOngoingEvents = async (
  count = 5
): Promise<Event[]> => {
  try {
    // Use cache with a specific key for this dashboard section
    const cacheKey = `dashboard:ongoing-events:${count}`;

    return await cacheService.getOrFetch<Event[]>(
      cacheKey,
      async () => {
        const currentUser = (await getCurrentUserData()) as unknown as Member;
        if (!currentUser) return [];

        // Determine if we're querying by faculty or program
        const queryField = currentUser.facultyId ? "facultyId" : "programId";
        const queryValue = currentUser.facultyId || currentUser.programId;

        if (!queryValue) {
          console.error("User has neither facultyId nor programId.");
          return [];
        }

        // Get today's date range for accurate filtering
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Query for events that are happening today
        const eventsQuery = query(
          collection(db, "events"),
          where("isDeleted", "==", false),
          where(queryField, "==", queryValue),
          where("date", ">=", Timestamp.fromDate(startOfDay)),
          where("date", "<=", Timestamp.fromDate(endOfDay)),
          limit(count)
        );

        const querySnapshot = await getDocs(eventsQuery);

        // Filter for only ongoing events (has ongoing status or is currently ongoing)
        const events = querySnapshot.docs.map(transformEventData);
        return events.filter((event) => {
          const status = determineEventStatus(new Date(event.date));
          return status === "ongoing";
        });
      },
      60 * 1000 // Cache for 1 minute since ongoing status changes frequently
    );
  } catch (error) {
    console.error("Error getting dashboard ongoing events:", error);
    return [];
  }
};


/**
 * Gets dashboard-specific ongoing events with minimal fields
 * Optimized to fetch only what's needed for the dashboard
 */
export const getDashboardEvents = async (
  count = 5
): Promise<Event[]> => {
  try {
    // Use cache with a specific key for this dashboard section
    const cacheKey = `dashboard:events:${count}`;

    return await cacheService.getOrFetch<Event[]>(
      cacheKey,
      async () => {
        const currentUser = (await getCurrentUserData()) as unknown as Member;
        if (!currentUser) return [];

        // Determine if we're querying by faculty or program
        const queryField = currentUser.facultyId ? "facultyId" : "programId";
        const queryValue = currentUser.facultyId || currentUser.programId;

        if (!queryValue) {
          console.error("User has neither facultyId nor programId.");
          return [];
        }


        // Query for events that are happening today
        const eventsQuery = query(
          collection(db, "events"),
          where("isDeleted", "==", false),
          where(queryField, "==", queryValue),
          limit(count)
        );

        const querySnapshot = await getDocs(eventsQuery);

        return querySnapshot.docs.map(transformEventData);
        
      },
      60 * 1000 // Cache for 1 minute since ongoing status changes frequently
    );
  } catch (error) {
    console.error("Error getting dashboard events:", error);
    return [];
  }
};



/**
 * Gets most recent members for the dashboard with minimal fields
 * Optimized to fetch only what's needed for the dashboard display
 */
export const getDashboardRecentMembers = async (
  count = 10
): Promise<Member[]> => {
  try {
    // Use cache with a specific key for this dashboard section
    const cacheKey = `dashboard:recent-members:${count}`;

    return await cacheService.getOrFetch<Member[]>(
      cacheKey,
      async () => {
        const currentUser = (await getCurrentUserData()) as unknown as Member;
        if (!currentUser) return [];

        // Determine if we're querying by faculty or program
        const queryField = currentUser.facultyId ? "facultyId" : "programId";
        const queryValue = currentUser.facultyId || currentUser.programId;

        if (!queryValue) {
          console.error("User has neither facultyId nor programId.");
          return [];
        }

        // Query for recently added members
        const membersQuery = query(
          collection(db, "users"),
          where("isDeleted", "==", false),
          where("role", "==", "user"),
          where(queryField, "==", queryValue),
          orderBy("createdAt", "desc"),
          limit(count)
        );

        const querySnapshot = await getDocs(membersQuery);

        // Transform to our Member type with only the needed fields for display
        return querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            studentId: data.studentId || "",
            programId: data.programId || "",
            yearLevel: data.yearLevel || 0,
            createdAt: data.createdAt,
          } as unknown as Member;
        });
      },
      CACHE_DURATIONS.USERS // Cache for 1 hour
    );
  } catch (error) {
    console.error("Error getting dashboard recent members:", error);
    return [];
  }
};

/**
 * Gets event and member count statistics for the dashboard
 */
export const getDashboardStats = async (): Promise<{
  totalStudents: number;
  totalEvents: number;
  totalAttendances: number;
  overallAttendanceRate: number;
  averageAttendance: number;
  peakAttendance: number;
  totalAbsences: number;
}> => {
  try {
    // Use cache with a specific key for dashboard stats
    const cacheKey = `dashboard:stats`;

    return await cacheService.getOrFetch<{
      totalStudents: number;
      totalEvents: number;
      totalAttendances: number;
      overallAttendanceRate: number;
      averageAttendance: number;
      peakAttendance: number;
      totalAbsences: number;
    }>(
      cacheKey,
      async () => {
        const currentUser = (await getCurrentUserData()) as unknown as Member;
        if (!currentUser) {
          return {
            totalStudents: 0,
            totalEvents: 0,
            totalAttendances: 0,
            overallAttendanceRate: 0,
            averageAttendance: 0,
            peakAttendance: 0,
            totalAbsences: 0,
          };
        }

        // Determine if we're querying by faculty or program
        const queryField = currentUser.facultyId ? "facultyId" : "programId";
        const queryValue = currentUser.facultyId || currentUser.programId;

        if (!queryValue) {
          console.error("User has neither facultyId nor programId.");
          return {
            totalStudents: 0,
            totalEvents: 0,
            totalAttendances: 0,
            overallAttendanceRate: 0,
            averageAttendance: 0,
            peakAttendance: 0,
            totalAbsences: 0,
          };
        }

        // Execute all count queries in parallel for efficiency
        const [studentsCount, eventsSnapshot, totalAttendances] =
          await Promise.all([
            // Get total students count
            getCountFromServer(
              query(
                collection(db, "users"),
                where("isDeleted", "==", false),
                where("role", "==", "user"),
                where(queryField, "==", queryValue)
              )
            ),
            // Get events with attendee counts
            getDocs(
              query(
                collection(db, "events"),
                where("isDeleted", "==", false),
                where(queryField, "==", queryValue)
              )
            ),
            // Get total attendances count (reuse the dedicated function)
            getDashboardAttendeeCount(),
          ]);

        const totalStudents = studentsCount.data().count;
        const totalEvents = eventsSnapshot.size;

        // Calculate event attendance statistics
        let peakAttendance = 0;

        // Find peak attendance
        eventsSnapshot.forEach((doc) => {
          const attendees = doc.data().attendees || 0;
          if (attendees > peakAttendance) {
            peakAttendance = attendees;
          }
        });

        // Handle case with no events or students to avoid division by zero
        if (totalEvents === 0 || totalStudents === 0) {
          return {
            totalStudents,
            totalEvents,
            totalAttendances: 0,
            overallAttendanceRate: 0,
            averageAttendance: 0,
            peakAttendance: 0,
            totalAbsences: 0,
          };
        }

        // Calculate the total possible attendances
        const totalPossibleAttendances = totalEvents * totalStudents;

        // Calculate overall attendance rate
        const overallAttendanceRate =
          (totalAttendances / totalPossibleAttendances) * 100;

        // Calculate average attendance per event
        const averageAttendance = totalAttendances / totalEvents;

        // Calculate total absences
        const totalAbsences = totalPossibleAttendances - totalAttendances;

        return {
          totalStudents,
          totalEvents,
          totalAttendances,
          overallAttendanceRate: parseFloat(overallAttendanceRate.toFixed(1)),
          averageAttendance: parseFloat(averageAttendance.toFixed(1)),
          peakAttendance,
          totalAbsences,
        };
      },
      5 * 60 * 1000 // Cache for 5 minutes
    );
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      totalStudents: 0,
      totalEvents: 0,
      totalAttendances: 0,
      overallAttendanceRate: 0,
      averageAttendance: 0,
      peakAttendance: 0,
      totalAbsences: 0,
    };
  }
};
