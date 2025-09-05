import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
  orderBy,
  limit,
  writeBatch,
  DocumentData,
  CollectionReference,
  Query,
  startAt,
  startAfter,
  QueryConstraint,
  getCountFromServer,
  DocumentSnapshot,
  documentId,
  or,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { getAuth } from "firebase/auth";
import {
  getUserById,
  getUsers,
  searchUserByName,
  searchUserByStudentId,
} from "./users"; // Assuming this is optimized
import {
  AttendanceRecord,
  EventAttendance,
} from "@/features/organization/log-attendance/types";
import { Member } from "@/features/organization/members/types";
import { incrementEventAttendees } from "./events";
import { eventAttendance } from "@/features/organization/dashboard/data";
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
 * Fetches the 10 most recent attendance records for an event, enriched with valid student data.
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
    const attendanceCollection = collection(db, "eventAttendees");
    const timestampField = type === "time-in" ? "timeIn" : "timeOut";

    // Step 1: Fetch the 10 most recent attendance documents from Firestore.
    const q: Query<DocumentData> = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where(timestampField, "!=", null),
      orderBy(timestampField, "desc"),
      limit(10)
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
  // NOTE: This can be inefficient for very large user bases.
  // For production scale, a dedicated search service like Algolia is recommended.
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
 * Builds an array of Firestore query constraints based on filter criteria.
 *
 * @param eventId - The ID of the event.
 * @param filterProgram - An optional program ID to filter by.
 *- @param studentIds - An optional array of student IDs to filter by (from a search).
 * @returns An array of QueryConstraint objects.
 */
export const buildAttendanceQueryConstraints = (
  eventId: string,
  filterProgram?: string,
  studentIds?: string[]
): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [where("eventId", "==", eventId)];

  if (filterProgram) {
    constraints.push(where("student.programId", "==", filterProgram));
  }

  // If studentIds are provided from a search, use a 'where in' clause.
  // This is more efficient and lifts restrictions on sorting.
  if (studentIds && studentIds.length > 0) {
    // Firestore 'in' queries are limited to 30 items.
    // We slice the array to prevent errors.
    const limitedIds = studentIds.slice(0, 30);
    constraints.push(where("student.studentId", "in", limitedIds));
  }

  return constraints;
};

/**
 * Fetches a paginated and sorted list of attendance records for a specific event.
 *
 * @param eventId - The ID of the event.
 * @param page - The page number to fetch (1-indexed).
 * @param pageSize - The number of records per page.
 * @param sort - An object containing the sort field and direction.
 * @param filterProgram - An optional program ID to filter results.
 * @param searchQuery - An optional search query for the student's name.
 * @returns A promise resolving to an object with records and the total count.
 */ export const getAttendanceRecord = async (
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
    const attendanceCollection = collection(db, "eventAttendees");
    let studentIds: string[] | undefined;

    // --- 2. Build Query Constraints ---
    const baseConstraints = buildAttendanceQueryConstraints(
      eventId,
      filterProgram,
      undefined
    );

    // --- 3. Get Total Count for Pagination ---
    const countQuery = query(attendanceCollection, ...baseConstraints);
    const totalSnapshot = await getCountFromServer(countQuery);
    const total = totalSnapshot.data().count;
    if (total === 0) {
      return { records: [], total: 0, nextCursor: null };
    }

    const getFirestoreSortField = (field: string): string => {
      switch (field) {
        case "firstName":
          return `student.firstName`;
        case "studentId":
          return `student.studentId`;
        default:
          return field;
      }
    };

    const queryConstraints: QueryConstraint[] = [
      ...baseConstraints,
      // This orderBy clause is essential for startAfter to work.
      orderBy(getFirestoreSortField(sort.field), sort.direction),
      limit(pageSize),
    ];

    if (cursor) {
      queryConstraints.push(startAfter(cursor));
    }

    const dataQuery = query(attendanceCollection, ...queryConstraints);
    const querySnapshot = await getDocs(dataQuery);

    // --- 5. Map Documents and Determine Next Cursor ---
    const docs = querySnapshot.docs;
    let records = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timeIn: data.timeIn?.toDate() ?? null,
        timeOut: data.timeOut?.toDate() ?? null,
      } as EventAttendance;
    });

    if (searchQuery) {
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