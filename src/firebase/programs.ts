/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { Member, Program } from "@/features/organization/members/types";
import { getCurrentUserData } from "./users";

const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  throw new Error(`Failed to ${context}`);
};

// Main function to get programs based on user role
export const getPrograms = async () => {
  try {
    const currentUser = (await getCurrentUserData()) as Member | null;
    if (!currentUser) return [];

    // **FIX:** If the user has a programId (is a student), fetch only that program.
    if (currentUser.programId) {
      const program = await getProgramById(currentUser.programId);
      return program ? [program] : []; // Return the single program in an array, or an empty array
    }

    // For other users (e.g., faculty, admin), fetch all programs.
    // This preserves the original logic for non-student roles.
    const programsCollection = collection(db, "programs");
    const querySnapshot = await getDocs(programsCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    handleFirestoreError(error, "fetch programs");
  }
};

// Fetches a single program directly by its ID
export const getProgramById = async (
  programId: string
): Promise<Program | null> => {
  try {
    // **FIX:** This function no longer calls getPrograms().
    // It fetches the document directly from Firestore, which is efficient and avoids the infinite loop.
    const docRef = doc(db, "programs", programId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Program;
    } else {
      console.warn(`No program found with ID: ${programId}`);
      return null;
    }
  } catch (error) {
    handleFirestoreError(error, `fetch program by ID: ${programId}`);
    return null; // Ensure null is returned on error
  }
};

// Fetches programs specifically for a faculty or a single student program
export const getProgramByFacultyId = async () => {
  try {
    const currentUser = (await getCurrentUserData()) as Member | null;
    if (!currentUser) return null;

    // Check if user is a student first
    if (currentUser.programId) {
      const program = await getProgramById(currentUser.programId);
      // **FIX:** Now correctly calls the fixed getProgramById function.
      return program ? [program] : null;
    }

    // Check if user is faculty
    if (currentUser.facultyId) {
      const programsCollection = collection(db, "programs");
      const q = query(
        programsCollection,
        where("facultyId", "==", currentUser.facultyId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // If user has neither ID, return null.
    console.error("User has neither facultyId nor programId.");
    return null;
  } catch (error) {
    handleFirestoreError(error, "fetch program by faculty ID");
    return null;
  }
};
