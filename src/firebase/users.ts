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
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { MemberFormData } from "@/lib/validators";
import { Member } from "@/features/organization/members/types";

// Define the collection reference once at the top level for reuse.
const usersCollection: CollectionReference<DocumentData> = collection(
  db,
  "users"
);

// Centralized error handler
const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  // Re-throwing allows the calling UI to handle the failed state.
  throw new Error(`Failed to ${context}.`);
};

/**
 * Fetches the facultyId for the currently authenticated user.
 * A private helper function to avoid code duplication in search functions.
 * @param uid - The user ID of the currently authenticated user.
 * @returns The facultyId string or null if not found or an error occurs.
 */
export const getCurrentUserFacultyId = async (
  uid: string
): Promise<string | null> => {
  if (!uid) {
    console.error("No user ID provided to fetch faculty ID.");
    return null;
  }
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    console.error("Authenticated user's document not found.");
    return null;
  }

  const facultyId = userDocSnap.data()?.facultyId;
  if (!facultyId) {
    console.error("Faculty ID not found for the authenticated user.");
    return null;
  }
  return facultyId;
};

// --- EXPORTED FUNCTIONS ---

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      member: { ...doc.data() },
    }));
  } catch (error) {
    // Standardized error handling.
    handleFirestoreError(error, "fetch users");
    return []; // Return an empty array on failure.
  }
};

export const addUser = async (userData: MemberFormData) => {
  try {
    const docRef = await addDoc(usersCollection, {
      ...userData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "add user");
  }
};

export const updateUser = async (userId: string, userData: MemberFormData) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    handleFirestoreError(error, `update user with ID ${userId}`);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { isDeleted: true, updatedAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, `soft delete user with ID ${userId}`);
  }
};

export const searchUserByStudentId = async (
  studentId: string,
  currentUser: any
): Promise<Member | null> => {
  // Encapsulated logic in a single try/catch block for comprehensive error handling.
  try {
    // Replaced duplicated code with a call to the new helper function.
    const facultyId = await getCurrentUserFacultyId(currentUser?.uid);
    if (!facultyId) {
      return null; // Stop if we can't get the facultyId.
    }

    const searchQuery = query(
      usersCollection,
      where("studentId", "==", studentId),
      where("facultyId", "==", facultyId)
    );

    const querySnapshot = await getDocs(searchQuery);

    if (querySnapshot.empty) {
      return null;
    }

    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as unknown as Member;
  } catch (error) {
    handleFirestoreError(error, `search for student ID "${studentId}"`);
    return null;
  }
};
export const searchUserByName = async (
  name: string,
  currentUser: any
): Promise<Member[]> => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return [];
    }

    const facultyId = await getCurrentUserFacultyId(currentUser?.uid);
    if (!facultyId) {
      return [];
    }

    // Create two separate queries for firstName and lastName.
    const firstNameQuery = query(
      usersCollection,
      where("facultyId", "==", facultyId),
      where("firstName", ">=", trimmedName),
      where("firstName", "<=", trimmedName + "\uf8ff")
    );

    const lastNameQuery = query(
      usersCollection,
      where("facultyId", "==", facultyId),
      where("lastName", ">=", trimmedName),
      where("lastName", "<=", trimmedName + "\uf8ff")
    );

    // Execute both queries in parallel for better performance.
    const [firstNameSnapshot, lastNameSnapshot] = await Promise.all([
      getDocs(firstNameQuery),
      getDocs(lastNameQuery),
    ]);

    // Use a Map to combine results and automatically handle duplicates.
    const uniqueMembers = new Map<string, Member>();

    // Add results from the first name query
    firstNameSnapshot.docs.forEach((doc) => {
      uniqueMembers.set(doc.id, {
        id: doc.id,
        ...doc.data(),
      } as unknown as Member);
    });

    // Add results from the last name query
    lastNameSnapshot.docs.forEach((doc) => {
      uniqueMembers.set(doc.id, {
        id: doc.id,
        ...doc.data(),
      } as unknown as Member);
    });

    // Convert the Map values back to an array and return.
    return Array.from(uniqueMembers.values());
  } catch (error) {
    handleFirestoreError(error, `search for name "${name}"`);
    return [];
  }
};

export const getUserById = async (userId: string): Promise<Member | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as unknown as Member;
    } else {
      return null;
    }
  } catch (error) {
    handleFirestoreError(error, `fetching user with ID ${userId}`);
    return null;
  }
};