import { Timestamp } from "firebase/firestore";

export type Member = {
  firstName: string;
  lastName: string;
  programId: string;
  facultyId: string;
  studentId: string;
  email: string;
  role: "admin" | "user";
  createdAt?: Timestamp;
  yearLevel?: number; // Adding year level
};

export type Program = {
  id: string;
  name: string;
  code?: string; // Program code like "BSCS", "BSES", "BSCE"
};

export type Faculty = {
  id: string;
  name: string;
  code?: string; // Faculty code like "FC", "FFES", "FE"
};

export type MemberData = {
  id: string;
  member: Member;
};
