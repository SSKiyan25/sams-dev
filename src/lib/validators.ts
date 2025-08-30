import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.date({ error: "Event date is required" }),
  timeInStart: z.string().optional(),
  timeInEnd: z.string().optional(),
  timeOutStart: z.string().optional(),
  timeOutEnd: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  note: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
