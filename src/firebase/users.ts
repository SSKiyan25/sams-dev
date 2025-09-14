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
  getDoc,
  CollectionReference,
  DocumentData,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { MemberFormData } from "@/lib/validators";
import { Member } from "@/features/organization/members/types";
import { getAuth } from "firebase/auth";
import { email } from "zod";
import { getProgramByFacultyId } from "./programs";

// Define the collection reference once at the top level for reuse.
const usersCollection: CollectionReference<DocumentData> = collection(
  db,
  "users"
);

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

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
    console.error("This is a course organization.");
    return null;
  }
  return facultyId;
};

/**
 * Fetches the complete user document for the currently authenticated user.
 * This is more efficient as it retrieves all necessary IDs in one go.
 * @returns The user's data object or null if not found.
 */
export const getCurrentUserData = async () => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    console.error("No user is currently authenticated.");
    return null;
  }

  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error("Authenticated user's document not found.");
      return null;
    }
    return { uid: currentUser.uid, ...userDocSnap.data() };
  } catch (error) {
    handleFirestoreError(error, "fetching current user");
    return null;
  }
};

export const getCurrentUser = async (uid: string) => {
  console.log("Current User UID:", uid);
  if (!uid) {
    console.error("No user is currently authenticated.");
    return null;
  }
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);
  if (!userDocSnap.exists()) {
    console.error("Authenticated user's document not found.");
    return null;
  }
  return {
    name: userDocSnap.data().name,
    email: userDocSnap.data().email,
  } as unknown as UserData;
};

// --- EXPORTED FUNCTIONS ---
/**
 * Fetches users based on the current user's context (faculty or program).
 */
export const getUsers = async () => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return [];

    // Determine the query field and value based on user type
    const queryField = currentUser.facultyId ? "facultyId" : "programId";
    const queryValue = currentUser.facultyId || currentUser.programId;

    if (!queryValue) {
      console.error("User has neither facultyId nor programId.");
      return [];
    }

    const usersQuery = query(
      usersCollection,
      where("isDeleted", "==", false),
      where("role", "==", "user"),
      where(queryField, "==", queryValue)
    );

    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      member: { ...doc.data() },
    }));
  } catch (error) {
    handleFirestoreError(error, "fetch users");
    return [];
  }
};

export const getRecentUsers = async () => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return [];

    // Determine the query field and value based on user type
    const queryField = currentUser.facultyId ? "facultyId" : "programId";
    const queryValue = currentUser.facultyId || currentUser.programId;

    if (!queryValue) {
      console.error("User has neither facultyId nor programId.");
      return [];
    }
    const recentUsersQuery = query(
      usersCollection,
      where("role", "==", "user"),
      where("isDeleted", "==", false),
      where(queryField, "==", queryValue),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(recentUsersQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      member: { ...doc.data() },
    }));
  } catch (error) {
    handleFirestoreError(error, "fetch recent users");
    return [];
  }
};

export const checkStudentIdExist = async (studentId: string) => {
  try {
    const querySnapshot = await getDocs(
      query(
        usersCollection,
        where("studentId", "==", studentId),
        where("isDeleted", "==", false)
      )
    );
    return !querySnapshot.empty;
  } catch (error) {
    handleFirestoreError(error, "check student ID existence");
    return false;
  }
};

export const addUser = async (userData: MemberFormData) => {
  try {
    if (await checkStudentIdExist(userData.studentId)) {
      throw new Error("Student ID already exists.");
    }
    if (userData == null) {
      throw new Error("No user data provided for addition.");
    }
    if (userData.yearLevel === undefined) {
      userData.yearLevel = 0;
    }
    const docRef = await addDoc(usersCollection, {
      ...userData,
      createdAt: Timestamp.now(),
      isDeleted: false,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "add user");
  }
};

export const updateUser = async (userId: string, userData: MemberFormData) => {
  try {
    if (userData == null) {
      throw new Error("No user data provided for update.");
    }
    if (userData.yearLevel === undefined) {
      userData.yearLevel = 0;
    }
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
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return null;

    // Determine the query field and value based on user type
    const queryField = currentUser.facultyId ? "facultyId" : "programId";
    const queryValue = currentUser.facultyId || currentUser.programId;

    if (!queryValue) {
      console.error("User has neither facultyId nor programId.");
      return null;
    }

    const searchQuery = query(
      usersCollection,
      where("studentId", "==", studentId),
      where(queryField, "==", queryValue),
      where("isDeleted", "==", false)
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
/**
 * Searches for users by name within a specific faculty.
 * This function fetches all users from the faculty and performs a "contains"
 * search on the client-side by concatenating the user's first and last names.
 *
 * @param name - The name to search for.
 * @param currentUser - The currently authenticated user object (e.g., from Firebase Auth).
 * @returns A promise that resolves to an array of matching Member objects.
 */
export const searchUserByName = async (
  name: string,
  currentUser: any
): Promise<Member[]> => {
  try {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) {
      // Return empty if the search name is blank after trimming.
      return [];
    }
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return [];

    // Determine the query field and value based on user type
    const queryField = currentUser.facultyId ? "facultyId" : "programId";
    const queryValue = currentUser.facultyId || currentUser.programId;

    if (!queryValue) {
      console.error("User has neither facultyId nor programId.");
      return [];
    }

    // 1. Query all non-deleted users for the given faculty.
    const allUsersQuery = query(
      usersCollection,
      where(queryField, "==", queryValue),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(allUsersQuery);

    // 2. Filter the results on the client-side.
    const matchingMembers = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }))
      .filter((member) => {
        // Concatenate first and last name to create a full name for searching.
        const fullName = `${member.firstName || ""} ${
          member.lastName || ""
        }`.toLowerCase();

        // Check if the full name includes the search term.
        return fullName.includes(trimmedName);
      });

    return matchingMembers;
  } catch (error) {
    handleFirestoreError(error, `search for name "${name}"`);
    return []; // Return an empty array on error.
  }
};
export const getUserById = async (userId: string): Promise<Member | null> => {
  try {
    const querySnapshot = await getDocs(
      query(
        usersCollection,
        where("id", "==", userId),
        where("isDeleted", "==", false)
      )
    );
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
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
