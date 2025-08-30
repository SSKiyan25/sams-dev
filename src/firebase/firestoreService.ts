import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { EventFormData } from "@/lib/validators";
import { create } from "domain";

const eventsCollection = collection(db, "events");

export const addEvent = async (eventData: EventFormData) => {
  try {
    const docRef = await addDoc(eventsCollection, {
      ...eventData,
      createdAt: Timestamp.now(),
      date: Timestamp.fromDate(eventData.date),
      attendees: 0,
      status: new Date(eventData.date) > new Date() ? "upcoming" : "ongoing",
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding event to Firestore:", error);
    throw new Error("Failed to add event");
  }
};

export const getEvents = async () => {
  try {
    const querySnapshot = await getDocs(eventsCollection);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    }));
    return events;
  } catch (error) {
    console.error("Error fetching events from Firestore:", error);
    throw new Error("Failed to fetch events");
  }
};

export const updateEvent = async (
  eventId: string,
  eventData: EventFormData
) => {
  const eventDoc = doc(db, "events", eventId);
  await updateDoc(eventDoc, {
    ...eventData,
    date: Timestamp.fromDate(eventData.date),
  });
};

export const archiveEvent = async (eventId: string) => {
  const eventDoc = doc(db, "events", eventId);
  await updateDoc(eventDoc, { status: "archived" });
};

export const deleteEvent = async (eventId: string) => {
  const eventDoc = doc(db, "events", eventId);
  await deleteDoc(eventDoc);
};
