/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase.config";
import { Program } from "@/features/organization/members/types";
import { getAuth } from "firebase/auth";
import { getCurrentUserFacultyId } from "./users";

const handleFirestoreError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  throw new Error(`Failed to ${context}`);
};

export const getPrograms = async () => {
  try {
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
    const facultyId = await getCurrentUserFacultyId(
      getAuth().currentUser?.uid || ""
    );
    if (!facultyId) {
      console.log("Could not determine faculty ID for the current user.");
      return null;
    }
    const programsCollection = collection(db, "programs");
    const q = query(programsCollection, where("facultyId", "==", facultyId));
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
