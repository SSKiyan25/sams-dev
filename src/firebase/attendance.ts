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
import { getCurrentUserFacultyId, searchUserByStudentId } from "./users"; // Assuming this is optimized
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
 */
export const getRecentAttendance = async (
  eventId: string,
  type: "time-in" | "time-out"
): Promise<AttendanceRecord[]> => {
  try {
    const facultyId = await getCurrentUserFacultyId(
      getAuth().currentUser?.uid || ""
    );
    const attendanceCollection = collection(db, "eventAttendees");
    const timestampField = type === "time-in" ? "timeIn" : "timeOut";

    // Step 1: Fetch the 9 most recent attendance documents from Firestore.
    const q: Query<DocumentData> = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where("student.facultyId", "==", facultyId || ""),
      where(timestampField, "!=", null),
      orderBy(timestampField, "desc"),
      limit(9)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];

    // Step 2: Map the raw documents to a preliminary list of records.
    const records: AttendanceRecord[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        eventId: data.eventId,
        timeIn: data.timeIn ? data.timeIn.toDate() : null,
        timeOut: data.timeOut ? data.timeOut.toDate() : null,
        status: data.status,
        timestamp: (data[timestampField] as Timestamp)?.toDate(),
      } as unknown as AttendanceRecord;
    });

    // Step 3: Fetch all corresponding student data in parallel for efficiency.
    const user = getAuth().currentUser;
    if (!user) {
      console.error("Authentication is required to fetch student details.");
      return []; // Cannot verify students without a logged-in user.
    }

    const studentPromises = records.map(async (record: any) => {
      return searchUserByStudentId(record.userId, user);
    });
    const students = await Promise.all(studentPromises);

    // Step 4: Combine records with student data, filtering out any null results.
    const validRecords = records.reduce((acc, record, index) => {
      const student = students[index] as Member | null;

      // **This is the key change**: Only include the record in the final array
      // if the student lookup was successful (the result is not null).
      if (student) {
        record.student = student;
        acc.push(record);
      }

      return acc;
    }, [] as AttendanceRecord[]);
    return validRecords;
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
 * Builds an array of Firestore query constraints for fetching attendance records.
 * @param eventId - The unique identifier for the event. This is a required filter.
 * @param filterProgram - (Optional) The program ID to filter attendees by.
 * @param studentIds - (Optional) An array of student IDs to filter the results with an 'in' query.
 * @returns An array of QueryConstraint objects to be used with a Firestore query.
 */
export const buildAttendanceQueryConstraints = (
  eventId: string,
  filterProgram?: string,
  facultyId?: string,
  studentIds?: string[]
): QueryConstraint[] => {
  // Start with the mandatory constraint to filter by the specific event.
  const constraints: QueryConstraint[] = [where("eventId", "==", eventId)];

  // If a program filter is provided, add it to the constraints.
  // This targets a nested field within the 'student' map.
  if (filterProgram) {
    constraints.push(where("student.programId", "==", filterProgram));
  }

  // If a faculty ID is provided, add it to the constraints.
  if (facultyId) {
    constraints.push(where("student.facultyId", "==", facultyId));
  }

  // If a list of student IDs is provided (e.g., from a separate search),
  // use a 'where in' clause for efficient filtering.
  if (studentIds && studentIds.length > 0) {
    // Firestore limits 'in' queries to a maximum of 30 values.
    // Slice the array to ensure the query does not exceed this limit and cause an error.
    const limitedIds = studentIds.slice(0, 30);
    constraints.push(where("student.studentId", "in", limitedIds));
  }

  // Return the final array of constraints.
  return constraints;
};

/**
 * Fetches a paginated and sorted list of attendance records for an event.
 * It first fetches all data based on filters and then applies the search query locally.
 * @param eventId - The unique identifier for the event to fetch records for.
 * @param pageSize - The number of records to return per page.
 * @param sort - An object specifying the field to sort by and the direction ('asc' or 'desc').
 * @param cursor - (Optional) The Firestore DocumentSnapshot to use as the starting point for the next page.
 * @param filterProgram - (Optional) The program ID to filter the attendance records by.
 * @param searchQuery - (Optional) An object containing the search query string and the type of search ('name' or 'id').
 * @returns A Promise resolving to an object with the list of records, the total count, and the cursor for the next page.
 */
export const getAttendanceRecord = async (
  eventId: string,
  pageSize: number,
  sort: { field: string; direction: "asc" | "desc" },
  cursor?: DocumentSnapshot,
  filterProgram?: string,
  searchQuery?: SearchParams | null
): Promise<{
  records: EventAttendance[];
  total: number;
  nextCursor: DocumentSnapshot | null;
}> => {
  try {
    const facultyId = await getCurrentUserFacultyId(
      getAuth().currentUser?.uid || ""
    );
    // Get a reference to the Firestore collection for event attendees.
    const attendanceCollection = collection(db, "eventAttendees");

    // Build the base query constraints from the event and program filters.
    // The search query is handled client-side, so we pass 'undefined' for studentIds here.
    const baseConstraints = buildAttendanceQueryConstraints(
      eventId,
      filterProgram,
      facultyId || "",
      undefined
    );

    // Create a query to get the total count of documents matching the base filters.
    // This is used for displaying total numbers and calculating total pages in the UI.
    const countQuery = query(attendanceCollection, ...baseConstraints);
    const totalSnapshot = await getCountFromServer(countQuery);
    const total = totalSnapshot.data().count;

    // If there are no records at all, return early to avoid unnecessary processing.
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

    // Assemble the final query constraints for fetching the actual data.
    // This includes the base filters, sorting, and page size limit.
    const queryConstraints: QueryConstraint[] = [
      ...baseConstraints,
      orderBy(getFirestoreSortField(sort.field), sort.direction),
      limit(pageSize),
    ];

    // If a cursor is provided (meaning we are fetching page 2 or beyond),
    // add the 'startAfter' constraint to begin fetching from the last document of the previous page.
    if (cursor) {
      queryConstraints.push(startAfter(cursor));
    }

    // Execute the final query to get the documents for the current page.
    const dataQuery = query(attendanceCollection, ...queryConstraints);
    const querySnapshot = await getDocs(dataQuery);

    // Store the raw documents for later use in determining the next cursor.
    const docs = querySnapshot.docs;

    // Map the raw Firestore documents to a clean array of EventAttendance objects.
    // This includes converting Firestore Timestamps to JavaScript Date objects.
    let records = docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timeIn: data.timeIn?.toDate() ?? null,
        timeOut: data.timeOut?.toDate() ?? null,
      } as EventAttendance;
    });

    // If a search query is provided, perform a client-side filter on the fetched records.
    if (searchQuery && searchQuery.query) {
      if (searchQuery.type === "id") {
        // Filter records where the student ID includes the search query string.
        records = records.filter((record) =>
          record.student?.studentId.toString().includes(searchQuery.query)
        );
      } else {
        // Filter records where the full name includes the search query string (case-insensitive).
        records = records.filter((record) => {
          const fullName =
            `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase();
          return fullName.includes(searchQuery.query.toLowerCase());
        });
      }
    }

    // Determine the cursor for the next page. If the number of fetched documents
    // equals the page size, it's likely there's more data. The last document
    // of the current set becomes the cursor for the next set.
    const nextCursor = docs.length === pageSize ? docs[docs.length - 1] : null;

    // Return the final data structure.
    return { records, total, nextCursor };
  } catch (error) {
    handleFirestoreError(error, `getting attendance for event ${eventId}`);
    return { records: [], total: 0, nextCursor: null };
  }
};

export const attendeesPresentCountForEvent = async (eventId: string) => {
  try {
    const facultyId = await getCurrentUserFacultyId(
      getAuth().currentUser?.uid || ""
    );
    const attendanceCollection = collection(db, "eventAttendees");
    const q = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where("student.facultyId", "==", facultyId || ""),
      where("status", "!=", "absent")
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    handleFirestoreError(error, `counting attendees for event ${eventId}`);
    return 0;
  }
};

export const totalAttendeesForEvent = async (eventId: string) => {
  try {
    const facultyId = await getCurrentUserFacultyId(
      getAuth().currentUser?.uid || ""
    );
    const attendanceCollection = collection(db, "eventAttendees");
    const q = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where("student.facultyId", "==", facultyId || "")
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    handleFirestoreError(
      error,
      `counting total attendees for event ${eventId}`
    );
    return 0;
  }
};

export const totalAttendeesForAllEvent = async () => {
  try {
    const facultyId = await getCurrentUserFacultyId(
      getAuth().currentUser?.uid || ""
    );
    const attendanceCollection = collection(db, "eventAttendees");
    const q = query(
      attendanceCollection,
      where("student.facultyId", "==", facultyId || "")
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    handleFirestoreError(error, `counting total attendees for all events`);
    return 0;
  }
};
