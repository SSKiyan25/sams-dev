"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AttendanceInterface } from "@/features/organization/log-attendance/components/AttendanceInterface";
import { PageHeader } from "@/features/organization/log-attendance/components/PageHeader";
import { Event } from "@/features/organization/log-attendance/data";
import {
  logAttendance,
  getEventById,
} from "@/features/organization/log-attendance/data";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarIcon,
  ClockIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Link from "next/link";

export default function LogAttendancePage() {
  const params = useParams();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading event data
    setIsLoading(true);

    setTimeout(() => {
      const foundEvent = getEventById(eventId);
      setEvent(foundEvent || null);
      setIsLoading(false);
    }, 500); // Simulate network delay
  }, [eventId]);

  const handleLogAttendance = async (
    studentId: string,
    type: "time-in" | "time-out"
  ) => {
    if (!event) return;
    if (event.status !== "ongoing") return;

    try {
      await logAttendance({
        eventId,
        studentId,
        type,
      });
      // Force a refresh of the recent attendance list if needed
    } catch (error) {
      console.error("Failed to log attendance:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <Card className="p-6">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The event you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href="/org-events">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  // Check if the event is not ongoing
  if (event.status !== "ongoing") {
    return (
      <div className="container mx-auto p-4">
        <PageHeader event={event} />

        <Card className="mt-6">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Attendance Logging Not Available</AlertTitle>
              <AlertDescription>
                Attendance can only be logged for ongoing events. This event is
                currently marked as &quot;{event.status}&quot;.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Date: {new Date(event.date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-muted-foreground">
                <ClockIcon className="mr-2 h-4 w-4" />
                <span>
                  {event.timeIn
                    ? `Time-in: ${event.timeIn.start} - ${event.timeIn.end}`
                    : "No time-in set"}
                </span>
              </div>

              {event.status === "upcoming" && (
                <p className="text-sm">
                  You will be able to log attendance when this event begins.
                </p>
              )}

              {(event.status === "completed" ||
                event.status === "archived") && (
                <p className="text-sm">
                  This event has ended. You can view the attendance records but
                  cannot log new entries.
                </p>
              )}

              <div className="flex justify-end">
                <Button asChild>
                  <Link href="/org-events">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Events
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader event={event} />
      <AttendanceInterface
        event={event}
        onLogAttendance={handleLogAttendance}
      />
    </div>
  );
}
