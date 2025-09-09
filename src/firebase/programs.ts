/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.config";
import { Program } from "@/features/organization/members/types";

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
