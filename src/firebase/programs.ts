/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase.config";
import { Member, Program } from "@/features/organization/members/types";
import { getAuth } from "firebase/auth";
import { getCurrentUserData, getCurrentUserFacultyId } from "./users";

const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  throw new Error(`Failed to ${context}`);
};

export const getPrograms = async () => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return [];

    // Determine the query field and value based on user type
    const field = currentUser.facultyId ? "facultyId" : "programId";
    const value = currentUser.facultyId || currentUser.programId;

    if (!value) {
      console.error("User has neither facultyId nor programId.");
      return [];
    }

    if (field === "programId") {
      // If the user is a student, fetch only their program
      const program = await getProgramById(value);
      return program ? [program] : [];
    }
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

export const getProgramById = async (programId: string) => {
  try {
    const programs = (await getPrograms()) as Program[];
    return programs.find((program) => program.id === programId);
  } catch (error) {
    handleFirestoreError(error, "fetch program by ID");
  }
};

export const getProgramByFacultyId = async () => {
  try {
    const currentUser = (await getCurrentUserData()) as unknown as Member;
    if (!currentUser) return null;
    const queryField = currentUser.facultyId ? "facultyId" : "programId";
    const queryValue = currentUser.facultyId || currentUser.programId;
    if (!queryValue) {
      console.error("User has neither facultyId nor program Id.");
      return null;
    }

    if (queryField === "programId") {
      const program = await getProgramById(queryValue);
      return program ? [program] : null;
    }
    const programsCollection = collection(db, "programs");
    const q = query(programsCollection, where("facultyId", "==", queryValue));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    handleFirestoreError(error, "fetch program by faculty ID");
    return null;
  }
};
