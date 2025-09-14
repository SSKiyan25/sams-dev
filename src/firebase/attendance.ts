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
  orderBy,
  limit,
  DocumentData,
  CollectionReference,
  Query,
  startAfter,
  QueryConstraint,
  getCountFromServer,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { getAuth } from "firebase/auth";
import {
  getCurrentUserData,
  getCurrentUserFacultyId,
  searchUserByStudentId,
} from "./users"; // Assuming this is optimized
import {
  AttendanceRecord,
  EventAttendance,
} from "@/features/organization/log-attendance/types";
import { Member } from "@/features/organization/members/types";
import { incrementEventAttendees } from "./events";
import { SearchParams } from "@/features/organization/attendees/types";

// --- Reusable Constants & Helpers ---

/**
 * A reusable reference to the 'eventAttendees' collection.
 * This avoids repeatedly calling collection() with the same arguments.
 */
const attendanceCollection: CollectionReference<DocumentData> = collection(
  db,
  "eventAttendees"
);

/**
 * A centralized error handler to keep error logging consistent.
 * @param error - The caught error object.
 * @param context - A string describing the context where the error occurred.
 */
const handleFirestoreError = (error: unknown, context: string): void => {
  console.error(`Error ${context}:`, error);
  // Depending on the app's needs, you could also throw a new, more specific error
  // or send the error to a logging service like Sentry or Firebase Crashlytics.
};

// --- Optimized Firestore Functions ---

/**
 * Logs a user's time-in or time-out for a specific event.
 * Creates a new record or updates an existing one.
 * @param eventId - The ID of the event.
 * @param studentId - The ID of the student.
 * @param type - The type of log, either 'time-in' or 'time-out'.
 */
export const logAttendance = async ({
  eventId,
  studentId,
  type,
}: {
  eventId: string;
  studentId: string;
  type: "time-in" | "time-out";
}): Promise<void> => {
  const q = query(
    attendanceCollection,
    where("eventId", "==", eventId),
    where("userId", "==", studentId),
    limit(1) // We only expect one record, so limit the result.
  );

  try {
    const querySnapshot = await getDocs(q);
    const now = Timestamp.now();
    const student = await searchUserByStudentId(
      studentId,
      getAuth().currentUser!
    );
    if (querySnapshot.empty) {
      // Create a new attendance record if one doesn't exist.
      await addDoc(attendanceCollection, {
        eventId,
        student: student == null ? "unknown" : student,
        userId: studentId,
        timeIn: type === "time-in" ? now : null,
        timeOut: type === "time-out" ? now : null,
        status: "partially present",
      });
      await incrementEventAttendees(eventId);
    } else {
      // Update the existing record.
      const recordDoc = querySnapshot.docs[0];
      const existingData = recordDoc.data();
      const updateData: { [key: string]: any } = {};

      if (type === "time-in") {
        updateData.timeIn = now;
      } else {
        // type === "time-out"
        updateData.timeOut = now;
      }

      // Determine the new status based on both time-in and time-out fields.
      const hasTimeIn = type === "time-in" || existingData.timeIn;
      const hasTimeOut = type === "time-out" || existingData.timeOut;
      updateData.status =
        hasTimeIn && hasTimeOut ? "present" : "partially present";
      await updateDoc(doc(db, "eventAttendees", recordDoc.id), updateData);
    }
  } catch (error) {
    handleFirestoreError(
      error,
      `logging attendance for student ${studentId} in event ${eventId}`
    );
  }
};

/**
 * Fetches the 9 most recent attendance records for an event, enriched with valid student data.
 * Records are excluded if the student does not exist or does not belong to the current user's faculty.
 * @param eventId - The ID of the event.
 * @param type - The type of log to sort by ('time-in' or 'time-out').
 * @returns A promise that resolves to an array of recent, valid attendance records.
 */ export const getRecentAttendance = async (
  eventId: string,
  type: "time-in" | "time-out"
): Promise<EventAttendance[]> => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return [];

    // **CHANGED**: Determine the correct field and value for the query
    const queryField = currentUser.facultyId
      ? "student.facultyId"
      : "student.programId";
    const queryValue = currentUser.facultyId || currentUser.programId;

    if (!queryValue) {
      console.error("User has neither facultyId nor programId.");
      return [];
    }

    const timestampField = type === "time-in" ? "timeIn" : "timeOut";

    const q = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where(timestampField, "!=", null),
      where(queryField, "==", queryValue),
      orderBy(timestampField, "desc"),
      limit(9)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];

    // Map documents to the EventAttendance type
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timeIn: data.timeIn?.toDate() ?? null,
        timeOut: data.timeOut?.toDate() ?? null,
      } as EventAttendance;
    });
  } catch (error) {
    handleFirestoreError(
      error,
      `fetching recent attendance for event ${eventId}`
    );
    return [];
  }
};

export const checkLogAttendanceExist = async (
  eventId: string,
  studentId: string,
  type: "time-in" | "time-out"
) => {
  try {
    const attendanceCollection = collection(db, "eventAttendees");
    const q = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where("userId", "==", studentId),
      where(type === "time-in" ? "timeIn" : "timeOut", "!=", null)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking attendance log:", error);
    return false;
  }
};
const usersCollection = collection(db, "users");

/**
 * Searches users whose full name (firstName + lastName) contains the search query.
 * This is more flexible than a simple "starts-with" query.
 *
 * @param name - The search query string.
 * @returns A promise that resolves to an array of matching user IDs.
 */
export const searchStudentIdsByName = async (
  name: string
): Promise<string[]> => {
  const trimmedName = name.trim().toLowerCase();
  if (!trimmedName) {
    return [];
  }

  // Fetch all users to filter client-side.
  const usersQuery = query(usersCollection, where("isDeleted", "==", false));
  const snapshot = await getDocs(usersQuery);

  const matchingIds = snapshot.docs
    .filter((doc) => {
      const userData = doc.data();
      const fullName = `${userData.firstName || ""} ${
        userData.lastName || ""
      }`.toLowerCase();
      return fullName.includes(trimmedName);
    })
    .map((doc) => doc.id);

  return matchingIds;
};
/**
 * **REFACTORED**
 * Dynamically builds query constraints based on the user's role (faculty or program).
 * @param eventId - The ID of the event.
 * @param currentUser - The authenticated user's data object.
 * @returns An array of Firestore query constraints.
 */
export const buildAttendanceQueryConstraints = (
  eventId: string,
  currentUser: Member,
  programFilter?: string
): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [where("eventId", "==", eventId)];

  // **CHANGED**: Dynamically add a filter for either facultyId or programId
  if (currentUser.facultyId) {
    constraints.push(where("student.facultyId", "==", currentUser.facultyId));
    if (programFilter) {
      constraints.push(where("student.programId", "==", programFilter));
    }
  } else if (currentUser.programId) {
    constraints.push(where("student.programId", "==", currentUser.programId));
  }

  return constraints;
};

/**
 * **REFACTORED**
 * Fetches a paginated and sorted list of attendance records for an event,
 * correctly scoped to either the user's faculty or program.
 */
export const getAttendanceRecord = async (
  eventId: string,
  pageSize: number,
  sort: { field: string; direction: "asc" | "desc" },
  cursor?: DocumentSnapshot,
  programFilter?: string,
  searchQuery?: SearchParams | null
): Promise<{
  records: EventAttendance[];
  total: number;
  nextCursor: DocumentSnapshot | null;
}> => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) {
      // If no user is logged in, return an empty result.
      return { records: [], total: 0, nextCursor: null };
    }

    // **CHANGED**: Build constraints based on the fetched user's data
    const baseConstraints = buildAttendanceQueryConstraints(
      eventId,
      currentUser,
      programFilter
    );

    const countQuery = query(attendanceCollection, ...baseConstraints);
    const totalSnapshot = await getCountFromServer(countQuery);
    const total = totalSnapshot.data().count;

    if (total === 0) {
      return { records: [], total: 0, nextCursor: null };
    }

    // Helper function to map front-end sort field names to their corresponding
    // paths in the Firestore document (e.g., 'firstName' -> 'student.firstName').
    const getFirestoreSortField = (field: string): string => {
      switch (field) {
        case "firstName":
          return `student.firstName`;
        case "studentId":
          return `student.studentId`;
        default:
          return field; // For fields like 'timeIn', which are at the top level.
      }
    };

    const queryConstraints: QueryConstraint[] = [
      ...baseConstraints,
      orderBy(getFirestoreSortField(sort.field), sort.direction),
      limit(pageSize),
    ];

    if (cursor) {
      queryConstraints.push(startAfter(cursor));
    }

    const dataQuery = query(attendanceCollection, ...queryConstraints);
    const querySnapshot = await getDocs(dataQuery);
    const docs = querySnapshot.docs;

    let records = docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timeIn: data.timeIn?.toDate() ?? null,
        timeOut: data.timeOut?.toDate() ?? null,
      } as EventAttendance;
    });

    // Client-side search logic remains the same
    if (searchQuery && searchQuery.query) {
      if (searchQuery.type === "id") {
        records = records.filter((record) =>
          record.student?.studentId.toString().includes(searchQuery.query)
        );
      } else {
        records = records.filter((record) => {
          const fullName =
            `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase();
          return fullName.includes(searchQuery.query.toLowerCase());
        });
      }
    }

    const nextCursor = docs.length === pageSize ? docs[docs.length - 1] : null;

    return { records, total, nextCursor };
  } catch (error) {
    handleFirestoreError(error, `getting attendance for event ${eventId}`);
    return { records: [], total: 0, nextCursor: null };
  }
};

export const totalAttendeesForAllEvent = async (): Promise<number> => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return 0;

    // **CHANGED**: Dynamically set the query field and value
    const queryField = currentUser.facultyId
      ? "student.facultyId"
      : "student.programId";
    const queryValue = currentUser.facultyId || currentUser.programId;

    if (!queryValue) {
      return 0;
    }

    const q = query(attendanceCollection, where(queryField, "==", queryValue));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    handleFirestoreError(error, `counting total attendees`);
    return 0;
  }
};
