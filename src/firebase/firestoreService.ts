import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { EventFormData, MemberFormData } from "@/lib/validators";

// Re-usable collection references
const eventsCollection = collection(db, "events");
const usersCollection = collection(db, "users");
const programsCollection = collection(db, "programs");
const facultiesCollection = collection(db, "faculties");

// ----------------------------------------------------------------
// ## Event Functions
// ----------------------------------------------------------------

/**
 * Adds a new event to the 'events' collection.
 * @param {EventFormData} eventData - The data for the new event.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export const addEvent = async (eventData: EventFormData): Promise<string> => {
  try {
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
      status: new Date(eventData.date) > new Date() ? "upcoming" : "ongoing",
      isDeleted: false, // Set isDeleted to false on creation
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding event to Firestore:", error);
    throw new Error("Failed to add event");
  }
};

/**
 * Fetches all events that are not soft-deleted.
 * @returns {Promise<any[]>} An array of event objects.
 */
export const getEvents = async (): Promise<any[]> => {
  try {
    // Query to get documents where isDeleted is false
    const q = query(eventsCollection, where("isDeleted", "==", false));
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(), // Convert Firestore Timestamp to JS Date
    }));
    return events;
  } catch (error) {
    console.error("Error fetching events from Firestore:", error);
    throw new Error("Failed to fetch events");
  }
};

/**
 * Updates an existing event.
 * @param {string} eventId - The ID of the event to update.
 * @param {EventFormData} eventData - The new data for the event.
 */
export const updateEvent = async (
  eventId: string,
  eventData: EventFormData
): Promise<void> => {
  try {
    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, {
      ...eventData,
      note: eventData.note || "",
      timeInStart: eventData.timeInStart || null,
      timeInEnd: eventData.timeInEnd || null,
      timeOutStart: eventData.timeOutStart || null,
      timeOutEnd: eventData.timeOutEnd || null,
      date: Timestamp.fromDate(eventData.date),
      updatedAt: Timestamp.now(), // Add an updated timestamp
    });
  } catch (error) {
    console.error("Error updating event in Firestore:", error);
    throw new Error("Failed to update event");
  }
};

export const getOngoingEvents = async (): Promise<any[]> => {
  const events = await getEvents();
  return events.filter((event) => event.status === "ongoing");
};

export const getCompletedEvents = async (): Promise<any[]> => {
  const events = await getEvents();
  return events.filter((event) => event.status === "completed");
};

export const getUpcomingEvents = async (): Promise<any[]> => {
  const events = await getEvents();
  return events.filter((event) => event.status === "upcoming");
};

/**
 * Soft deletes an event by setting its 'isDeleted' flag to true.
 * @param {string} eventId - The ID of the event to delete.
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, { isDeleted: true });
  } catch (error) {
    console.error("Error deleting event in Firestore:", error);
    throw new Error("Failed to delete event");
  }
};

export const archiveEvent = async (eventId: string) => {
  const eventDoc = doc(db, "events", eventId);
  await updateDoc(eventDoc, { status: "archived" });
};

// ----------------------------------------------------------------
// ## User Functions
// ----------------------------------------------------------------

/**
 * Adds a new user to the 'users' collection.
 * @param {MemberFormData} userData - The data for the new user.
 * @returns {Promise<string>} The ID of the newly created document.
 */
export const addUser = async (userData: MemberFormData): Promise<string> => {
  try {
    const docRef = await addDoc(usersCollection, {
      ...userData,
      createdAt: Timestamp.now(),
      isDeleted: false, // Set isDeleted to false on creation
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    throw new Error("Failed to add user");
  }
};

/**
 * Fetches all users that are not soft-deleted.
 * @returns {Promise<any[]>} An array of user objects.
 */
export const getUsers = async (): Promise<any[]> => {
  try {
    // Query to get documents where isDeleted is false
    const q = query(usersCollection, where("isDeleted", "==", false));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      member: { ...doc.data() },
    }));
    return users;
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    throw new Error("Failed to fetch users");
  }
};

/**
 * Updates an existing user.
 * @param {string} userId - The ID of the user to update.
 * @param {MemberFormData} userData - The new data for the user.
 */
export const updateUser = async (
  userId: string,
  userData: MemberFormData
): Promise<void> => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating user in Firestore:", error);
    throw new Error("Failed to update user");
  }
};

/**
 * Soft deletes a user by setting their 'isDeleted' flag to true.
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { isDeleted: true });
  } catch (error) {
    console.log("Error deleting user in Firestore:", error);
    throw new Error("Failed to delete user");
  }
};

// ----------------------------------------------------------------
// ## Other Collection Functions (Programs, Faculties)
// ----------------------------------------------------------------

export const getPrograms = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(programsCollection);
    const programs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return programs;
  } catch (error) {
    console.error("Error fetching programs from Firestore:", error);
    throw new Error("Failed to fetch programs");
  }
};

export const getFaculties = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(facultiesCollection);
    const faculties = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return faculties;
  } catch (error) {
    console.error("Error fetching faculties from Firestore:", error);
    throw new Error("Failed to fetch faculties");
  }
};