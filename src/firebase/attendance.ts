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
} from "firebase/firestore";
import { db } from "./firebase.config";
import { getAuth } from "firebase/auth";
import { getUserById, searchUserByStudentId } from "./users"; // Assuming this is optimized
import { AttendanceRecord } from "@/features/organization/log-attendance/types";
import { Member } from "@/features/organization/members/types";

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

    if (querySnapshot.empty) {
      // Create a new attendance record if one doesn't exist.
      await addDoc(attendanceCollection, {
        eventId,
        userId: studentId,
        timeIn: type === "time-in" ? now : null,
        timeOut: type === "time-out" ? now : null,
        status: "partially present",
      });
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
        timeIn: data.timeIn,
        timeOut: data.timeOut,
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
    }, [] as AttendanceRecord[]); // Initialize the accumulator as an empty array.

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