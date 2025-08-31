import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.config";

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