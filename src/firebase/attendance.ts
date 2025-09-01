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
} from "firebase/firestore";
import { db } from "./firebase.config";
import { AttendanceRecord } from "@/features/organization/log-attendance/types";
import { searchUserByStudentId } from "./users";
import { Member } from "@/features/organization/members/types";

export const logAttendance = async ({
  eventId,
  studentId,
  type,
}: {
  eventId: string;
  studentId: string;
  type: "time-in" | "time-out";
}) => {
  try {
      const attendanceCollection = collection(db, "eventAttendees");
      
      // Check if attednace record alread exist
      const q = query(attendanceCollection, where("eventId", "==", eventId), where("studentId", "==", studentId));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          // This means, record exists, just update the attendance record
          const docId = querySnapshot.docs[0].id;
          const attendaceDoc = doc(db, "eventAttendees", docId);
          const existingAttendanceData = querySnapshot.docs[0].data();

          // Handling status update
          let status = existingAttendanceData.status;
          const updateData: { [key: string]: any } = {};

          if (type == "time-in") {
              updateData.timeIn = Timestamp.now();
              if (existingAttendanceData.timeOut) {
                  status = "present";
              }
              else {
                  status = "partially present";
              }
          } else if (type == "time-out") {
              updateData.timeOut = Timestamp.now();
              if (existingAttendanceData.timeIn) {
                  status = "present";
              }
              else {
                  status = "partially present";
              }
          }
          updateData.status = status;
          await updateDoc(attendaceDoc, updateData);
      }
      else {
          const timeIn = type == "time-in" ? Timestamp.now() : null;
          const timeOut = type == "time-out" ? Timestamp.now() : null;

          await addDoc(attendanceCollection, {
              userId: studentId,
              eventId: eventId,
              timeIn,
              timeOut,
              status: "partially present",
          });
      }
  } catch (error) {
    console.error("Error logging attendance:", error);
  }
};

export const getRecentAttendance = async (
  eventId: string,
  type: "time-in" | "time-out"
): Promise<AttendanceRecord[]> => {
  try {
    const attendanceCollection = collection(db, "eventAttendees");

    // Determine which timestamp field to order by ('timeIn' or 'timeOut')
    const timestampField = type === "time-in" ? "timeIn" : "timeOut";

    const q = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      // Ensure we only get records that have the relevant timestamp
      where(timestampField, "!=", null),
      // Order by the most recent timestamp for the given type
      orderBy(timestampField, "desc"),
      // Get the 10 most recent records
      limit(10)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return []; // Return an empty array if no records are found
    }

    // Map the documents to the AttendanceRecord type, including the ID
    const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AttendanceRecord, "id">),
        userId: doc.data().userId,  
        timestamp: type == "time-in" ? doc.data().timeIn.toDate() : doc.data().timeOut.toDate(),
    }));

    for (const record of records) {
        record.student = await searchUserByStudentId(record.userId) as Member;
    }

    return records;
  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    // Return an empty array in case of an error to prevent crashes
    return [];
  }
};

export const checkLogAttendanceExist = async (eventId: string, studentId: string, type: "time-in" | "time-out") => {
  try {
    const attendanceCollection = collection(db, "eventAttendees");
    const q = query(
      attendanceCollection,
      where("eventId", "==", eventId),
      where("userId", "==", studentId),
      where(type === "time-in" ? "timeIn" : "timeOut", "!=", null)
    );

    const querySnapshot = await getDocs(q);

    
    console.log(querySnapshot);

    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking attendance log:", error);
    return false;
  }
};
