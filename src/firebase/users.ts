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
import { MemberFormData } from "@/lib/validators";
import { Member } from "@/features/organization/members/types";

const usersCollection = collection(db, "users");

const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  throw new Error(`Failed to ${context}`);
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      member: { ...doc.data() },
    }));
  } catch (error) {
    handleFirestoreError(error, "fetch users");
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

export const searchUserByStudentId = async (
  studentId: string
): Promise<Member | null> => {
  try {
    const usersCollection = collection(db, "users");
    const searchQuery = query(
      usersCollection,
      where("studentId", "==", studentId)
    );

    const querySnapshot = await getDocs(searchQuery);
    return querySnapshot.empty
      ? null
      : (querySnapshot.docs[0].data() as Member);
  } catch (error) {
    handleFirestoreError(error, "search user by student ID");
    return null;
  }
};
export const searchUserByName = async (name: string): Promise<Member[]> => {
  if (!name.trim()) {
    return [];
  }

  const usersCollection = collection(db, "users");
  const searchQuery = query(
    usersCollection,
    where("firstName", ">=", name),
    where("firstName", "<=", name + "\uf8ff")
  );

  try {
    const querySnapshot = await getDocs(searchQuery);
    if (querySnapshot.empty) {
      return []; // Always return an array
    }

    const results: Member[] = [];
    querySnapshot.forEach((doc) => {
      // Make sure to include the document ID
      results.push({ ...doc.data() } as Member);
    });

    return results;
  } catch (error) {
    console.error("Error searching for user by name:", error);
    return []; // Return an empty array on error
  }
};
