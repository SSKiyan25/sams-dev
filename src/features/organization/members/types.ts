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
};

export type Program = {
  id: string;
  name: string;
};

export type Faculty = {
  id: string;
  name: string;
};

export type MemberData = {
  id: string;
  member: Member;
};
