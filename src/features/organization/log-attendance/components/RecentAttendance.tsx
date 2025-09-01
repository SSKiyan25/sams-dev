import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
  ClockIcon,
  CheckCircleIcon,
  RefreshCcw,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "../utils";
import Link from "next/link";
import { getRecentAttendance } from "@/firebase";
import { AttendanceRecord } from "../types";

interface RecentAttendanceProps {
  eventId: string;
  type: "time-in" | "time-out";
  organizationId?: string;
}

export function RecentAttendance({
  eventId,
  type,
  organizationId = "",
}: RecentAttendanceProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showNames, setShowNames] = useState(false);
  const MAX_VISIBLE_RECORDS = 9;

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const recentRecords = (await getRecentAttendance(
        eventId,
        type
      )) as unknown as AttendanceRecord[];
      setRecords(recentRecords);
    } catch (error) {
      console.error("Failed to load recent attendance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, type]);

  useEffect(() => {
    loadAttendance();

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(loadAttendance, 30000);

    return () => clearInterval(intervalId);
  }, [loadAttendance]);

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Show only the first MAX_VISIBLE_RECORDS records
  const visibleRecords = records.slice(0, MAX_VISIBLE_RECORDS);
  //   const hasMoreRecords = records.length > MAX_VISIBLE_RECORDS;

  // Determine the attendees page URL
  const attendeesUrl = organizationId
    ? `/organization/${organizationId}/events/${eventId}/attendance`
    : `/org-events/${eventId}/attendance`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <CardTitle>
              Recent {type === "time-in" ? "Time-Ins" : "Time-Outs"}
            </CardTitle>
            <CardDescription className="mt-1 sm:mt-0">
              Students who have recently{" "}
              {type === "time-in" ? "timed in" : "timed out"} for this event
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadAttendance}
              className="h-8 flex-1 sm:flex-none"
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNames(!showNames)}
              className="h-8 flex-1 sm:flex-none"
            >
              {showNames ? (
                <>
                  <EyeOffIcon className="h-4 w-4 mr-2" />
                  Hide Names
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Show Names
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {type === "time-in" ? "time-ins" : "time-outs"} recorded yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleRecords.map((record) => (
              <div
                key={record.id}
                className="border rounded-md p-4 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 bg-primary/10 text-primary">
                    <AvatarFallback>
                      {showNames
                        ? getInitials(
                            record.student.firstName +
                              " " +
                              record.student.lastName
                          )
                        : "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {showNames
                        ? record.student.firstName +
                          " " +
                          record.student.lastName
                        : "Student"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      ID: {record.student.studentId}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center"
                  >
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                  {formatTime(new Date(record.timestamp))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {!isLoading && (
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button asChild variant="outline">
            <Link href={attendeesUrl}>
              <UsersIcon className="h-4 w-4 mr-2" />
              View All Attendees ({records.length})
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
