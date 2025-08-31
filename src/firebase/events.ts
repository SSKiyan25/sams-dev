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
import { EventFormData } from "@/lib/validators";
import { Event } from "@/features/organization/events/types";

const eventsCollection = collection(db, "events");

// Helper to manage errors
const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  throw new Error(`Failed to ${context}`);
};

// Helper to transform event data
const transformEventData = (doc: any) => ({
  id: doc.id,
  ...doc.data(),
  date: doc.data().date.toDate(),
});

export const addEvent = async (eventData: EventFormData) => {
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
      isDeleted: false, 
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "add event");
  }
};

export const getEvents = async (status?: "ongoing" | "upcoming") => {
  try {
    let q = query(eventsCollection, where("isDeleted", "==", false));
    if (status) {
      q = query(q, where("status", "==", status));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformEventData);
  } catch (error) {
    handleFirestoreError(error, "fetch events");
  }
};

export const updateEvent = async (
  eventId: string,
  eventData: EventFormData
) => {
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
    });
  } catch (error) {
    handleFirestoreError(error, `update event with ID ${eventId}`);
  }
};

export const archiveEvent = async (eventId: string) => {
  try {
    const eventDoc = doc(db, "events", eventId);
    await updateDoc(eventDoc, { status: "archived" });
  } catch (error) {
    handleFirestoreError(error, `archive event with ID ${eventId}`);
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
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