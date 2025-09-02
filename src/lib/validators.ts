import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.date({ error: "Event date is required" }),
  majorEvent: z.boolean().optional(),
  timeInStart: z.string().optional(),
  timeInEnd: z.string().optional(),
  timeOutStart: z.string().optional(),
  timeOutEnd: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  note: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const memberSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  email: z.string().min(5, "Email is required").email("Invalid email"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  programId: z.string().min(1, "Program is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  role: z.enum(["admin", "user"]),
});

export type MemberFormData = z.infer<typeof memberSchema>;
