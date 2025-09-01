import { Member } from "../members/types";


export type AttendanceRecord = {
  id: string;
  eventId: number;
  student: Member;
  timestamp: string;
  type: "time-in" | "time-out";
};
