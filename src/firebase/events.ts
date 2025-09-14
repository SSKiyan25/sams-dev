/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  query,
  where,
  writeBatch,
  getDoc,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
  getCountFromServer,
  increment,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { EventFormData } from "@/lib/validators";
import { Event } from "@/features/organization/events/types";
import {
  determineEventStatus,
  getEventsNeedingStatusUpdate,
} from "@/utils/eventStatusUtils";
import { getCurrentUserFacultyId } from "./users";
import { getAuth } from "firebase/auth";

const eventsCollection = collection(db, "events");

// Helper to manage errors
const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  
  // If it's already an Error object with a message, preserve it
  if (error instanceof Error) {
    throw error;
  }
  
  // Otherwise, create a generic error
  throw new Error(`Failed to ${context}`);
};

// Helper to transform event data
const transformEventData = (doc: any): Event => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data.date?.toDate ? data.date.toDate() : data.date,
  } as Event;
};

export interface PaginatedEvents {
  events: Event[];
  totalCount: number;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Get paginated events with server-side filtering and sorting
 */
export const getPaginatedEvents = async (
  status?: "ongoing" | "upcoming" | "completed" | "archived" | "all",
  sortField: string = "date",
  sortDirection: "asc" | "desc" = "desc",
  pageSize: number = 5,
  startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null,
  searchQuery?: string,
  skip: number = 0,
  filterDate?: Date
): Promise<PaginatedEvents> => {
  try {
    // Get the current user's faculty ID
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to fetch events");
    }
    
    const facultyId = await getCurrentUserFacultyId(currentUser.uid);
    if (!facultyId) {
      throw new Error("Could not determine faculty ID for the current user");
    }

    // Base query - filter by faculty and non-deleted events
    let baseQuery = query(
      eventsCollection, 
      where("isDeleted", "==", false),
      where("facultyId", "==", facultyId)
    );

    // Add status filter if provided and not "all"
    if (status && status !== "all") {
      baseQuery = query(baseQuery, where("status", "==", status));
    }

    // Add date filter if provided
    // In Firestore, we need to filter by a specific day range
    if (filterDate) {
      // Start of the day
      const startDate = new Date(filterDate);
      startDate.setHours(0, 0, 0, 0);

      // End of the day
      const endDate = new Date(filterDate);
      endDate.setHours(23, 59, 59, 999);

      // Add date range filter
      baseQuery = query(
        baseQuery,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate))
      );
    }

    // Add sorting
    const sortFieldPath =
      sortField === "name" || sortField === "attendees" ? sortField : "date";
    const sortedQuery = query(baseQuery, orderBy(sortFieldPath, sortDirection));

    // Get total count for pagination
    const countSnapshot = await getCountFromServer(sortedQuery);
    const totalCount = countSnapshot.data().count;

    // Execute query - get all results for this query
    const snapshot = await getDocs(sortedQuery);
    const allEvents = snapshot.docs.map(transformEventData);

    // Manual pagination using skip and limit
    const events = allEvents.slice(skip, skip + pageSize);

    // Update event statuses if needed
    const eventsToUpdate = getEventsNeedingStatusUpdate(events);
    if (eventsToUpdate.length > 0) {
      await updateEventStatuses(eventsToUpdate);
      // If we're filtering by status, refetch to get accurate results
      if (status && status !== "all") {
        return getPaginatedEvents(
          status,
          sortField,
          sortDirection,
          pageSize,
          startAfterDoc,
          searchQuery,
          skip,
          filterDate
        );
      }
    }

    return {
      events,
      totalCount,
      lastDoc: null, // We're not using cursor pagination anymore
      hasMore: skip + pageSize < totalCount,
    };
  } catch (error) {
    handleFirestoreError(error, "fetch paginated events");
    return {
      events: [],
      totalCount: 0,
      lastDoc: null,
      hasMore: false,
    };
  }
};

export const addEvent = async (eventData: EventFormData) => {
  try {
    // Get the current user's faculty ID
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to create events");
    }
    
    const facultyId = await getCurrentUserFacultyId(currentUser.uid);
    if (!facultyId) {
      throw new Error("Could not determine faculty ID for the current user");
    }

    // Validate that the event date is not in the past
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    const eventDate = new Date(eventData.date);
    eventDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    if (eventDate < currentDate) {
      throw new Error("Cannot create an event with a date in the past");
    }

    // Validate time ranges
    // 1. Time In Start should be before Time In End
    if (eventData.timeInStart && eventData.timeInEnd) {
      if (eventData.timeInStart >= eventData.timeInEnd) {
        throw new Error("Time In Start must be earlier than Time In End");
      }
    }

    // 2. Time Out Start should be before Time Out End
    if (eventData.timeOutStart && eventData.timeOutEnd) {
      if (eventData.timeOutStart >= eventData.timeOutEnd) {
        throw new Error("Time Out Start must be earlier than Time Out End");
      }
    }

    // 3. Time In End should be before Time Out Start (Time In period should complete before Time Out begins)
    if (eventData.timeInEnd && eventData.timeOutStart) {
      if (eventData.timeInEnd > eventData.timeOutStart) {
        throw new Error("Time In period must complete before Time Out period begins");
      }
    }

    const status = determineEventStatus(eventData.date);
    const docRef = await addDoc(eventsCollection, {
      ...eventData,
      note: eventData.note || "",
      timeInStart: eventData.timeInStart || null,
      timeInEnd: eventData.timeInEnd || null,
      timeOutStart: eventData.timeOutStart || null,
      timeOutEnd: eventData.timeOutEnd || null,
      createdAt: Timestamp.now(),
      date: Timestamp.fromDate(eventData.date),
      attendees: 0,
      status,
      isDeleted: false,
      facultyId, // Associate event with the creating faculty
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "add event");
  }
};

export const updateEvent = async (
  eventId: string,
  eventData: EventFormData
) => {
  try {
    // Validate time ranges (same validations as addEvent)
    // 1. Time In Start should be before Time In End
    if (eventData.timeInStart && eventData.timeInEnd) {
      if (eventData.timeInStart >= eventData.timeInEnd) {
        throw new Error("Time In Start must be earlier than Time In End");
      }
    }

    // 2. Time Out Start should be before Time Out End
    if (eventData.timeOutStart && eventData.timeOutEnd) {
      if (eventData.timeOutStart >= eventData.timeOutEnd) {
        throw new Error("Time Out Start must be earlier than Time Out End");
      }
    }

    // 3. Time In End should be before Time Out Start (Time In period should complete before Time Out begins)
    if (eventData.timeInEnd && eventData.timeOutStart) {
      if (eventData.timeInEnd > eventData.timeOutStart) {
        throw new Error("Time In period must complete before Time Out period begins");
      }
    }

    // Get current event to check if it belongs to the faculty and if it's archived
    const currentEvent = await getEventById(eventId);
    if (!currentEvent) {
      throw new Error("Event not found or you don't have permission to update it");
    }

    const eventDoc = doc(db, "events", eventId);

    // If event is archived, maintain archived status
    // Otherwise, determine status based on date
    const status =
      currentEvent?.status === "archived"
        ? "archived"
        : determineEventStatus(eventData.date);

    await updateDoc(eventDoc, {
      ...eventData,
      note: eventData.note || "",
      timeInStart: eventData.timeInStart || null,
      timeInEnd: eventData.timeInEnd || null,
      timeOutStart: eventData.timeOutStart || null,
      timeOutEnd: eventData.timeOutEnd || null,
      date: Timestamp.fromDate(eventData.date),
      status, // Set status automatically based on date
    });
  } catch (error) {
    handleFirestoreError(error, `update event with ID ${eventId}`);
  }
};

export const incrementEventAttendees = async (eventId: string) => {
  try {
    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, {
      attendees: increment(1),
    });
  } catch (error) {
    handleFirestoreError(
      error,
      `increment attendees for event with ID ${eventId}`
    );
  }
};

export const updateEventStatuses = async (
  events: Event[]
): Promise<boolean> => {
  try {
    const batch = writeBatch(db);

    events.forEach((event) => {
      // Skip archived events - they stay archived
      if (event.status === "archived") return;

      // Convert ID to string if it's a number
      const eventId =
        typeof event.id === "number" ? String(event.id) : event.id;
      const eventDoc = doc(db, "events", eventId);

      const newStatus = determineEventStatus(new Date(event.date));

      if (event.status !== newStatus) {
        batch.update(eventDoc, { status: newStatus });
      }
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error updating event statuses:", error);
    return false;
  }
};

export const getEvents = async (
  status?: "ongoing" | "upcoming" | "completed"
): Promise<Event[]> => {
  try {
    // Get the current user's faculty ID
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to fetch events");
    }
    
    const facultyId = await getCurrentUserFacultyId(currentUser.uid);
    if (!facultyId) {
      throw new Error("Could not determine faculty ID for the current user");
    }

    let q = query(
      eventsCollection, 
      where("isDeleted", "==", false),
      where("facultyId", "==", facultyId)
    );
    if (status) {
      q = query(q, where("status", "==", status));
    }
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(transformEventData);

    // Check for events that need status updates
    const eventsToUpdate = getEventsNeedingStatusUpdate(events);
    if (eventsToUpdate.length > 0) {
      await updateEventStatuses(eventsToUpdate);
      // If we're filtering by status, refetch to get accurate results
      if (status) {
        return getEvents(status);
      }
    }

    return events;
  } catch (error) {
    handleFirestoreError(error, "fetch events");
    return []; // Return empty array on error
  }
};

export const getEventsByStatus = async (status: string) => {
  try {
    // Get the current user's faculty ID
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to fetch events");
    }
    
    const facultyId = await getCurrentUserFacultyId(currentUser.uid);
    if (!facultyId) {
      throw new Error("Could not determine faculty ID for the current user");
    }

    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("status", "==", status),
      where("isDeleted", "==", false),
      where("facultyId", "==", facultyId)
    );
    const querySnapshot = await getDocs(q);

    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      events.push(transformEventData(doc));
    });

    return events;
  } catch (error) {
    console.error("Error fetching events by status:", error);
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    // Get the current user's faculty ID
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to fetch event");
    }
    
    const facultyId = await getCurrentUserFacultyId(currentUser.uid);
    if (!facultyId) {
      throw new Error("Could not determine faculty ID for the current user");
    }

    const eventDoc = doc(db, "events", eventId);
    const docSnap = await getDoc(eventDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.isDeleted === false && data.facultyId === facultyId) {
        return transformEventData({ id: docSnap.id, data: () => data });
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, `get event with ID ${eventId}`);
    return null;
  }
};

export const archiveEvent = async (eventId: string) => {
  try {
    // Verify the event belongs to the current faculty before archiving
    const currentEvent = await getEventById(eventId);
    if (!currentEvent) {
      throw new Error("Event not found or you don't have permission to archive it");
    }

    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, { status: "archived" });
  } catch (error) {
    handleFirestoreError(error, `archive event with ID ${eventId}`);
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    // Verify the event belongs to the current faculty before deleting
    const currentEvent = await getEventById(eventId);
    if (!currentEvent) {
      throw new Error("Event not found or you don't have permission to delete it");
    }

    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, { isDeleted: true }); // Soft delete
  } catch (error) {
    handleFirestoreError(error, `delete event with ID ${eventId}`);
  }
};

export const getOngoingEvents = async () => {
  return (await getEvents("ongoing")) as Event[];
};

export const getUpcomingEvents = async () => {
  return (await getEvents("upcoming")) as Event[];
};
