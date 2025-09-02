import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Event } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface ShortcutLinksProps {
  upcomingEvents: Event[];
  ongoingEvents: Event[];
  isLoading: boolean;
}

export function ShortcutLinks({
  upcomingEvents,
  ongoingEvents,
  isLoading,
}: ShortcutLinksProps) {
  const allEvents = [...ongoingEvents, ...upcomingEvents].slice(0, 3);

  // console.log("ShortcutLinks props:", {
  //   upcomingEvents,
  //   ongoingEvents,
  //   isLoading,
  // });

  const formatTime = (time: string | null) => {
    if (!time) return null;

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Format time range
  const formatTimeRange = (
    timeStart: string | null,
    timeOutStart: string | null
  ) => {
    if (!timeStart || !timeOutStart) return null;
    return `${formatTime(timeStart)} - ${formatTime(timeOutStart)}`;
  };

  // Function to display the time information with proper terminology
  const getTimeDisplay = (
    timeInStart: string | null,
    timeInEnd: string | null,
    timeOutStart: string | null,
    timeOutEnd: string | null
  ) => {
    console.log(timeInStart, timeInEnd, timeOutStart, timeOutEnd);
    if (timeInStart && timeInEnd && timeOutStart && timeOutEnd) {
      return (
        <>
          <div>Time-in: {formatTimeRange(timeInStart, timeInEnd)}</div>
          <div>Time-out: {formatTimeRange(timeOutStart, timeOutEnd)}</div>
        </>
      );
    } else if (timeInStart && !timeOutStart) {
      return <div>Time-in only: {formatTimeRange(timeInStart, timeInEnd)}</div>;
    } else if (!timeInStart && timeOutStart) {
      return (
        <div>Time-out only: {formatTimeRange(timeOutStart, timeOutEnd)}</div>
      );
    } else {
      return "No time set";
    }
  };

  // Format date to a user-friendly format
  const formatDate = (date: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  // Skeleton loader for events
  const EventSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center mb-0.5">
                  <Skeleton className="h-4 w-4 -ml-6 mr-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32 ml-0" />
                <Skeleton className="h-4 w-36 ml-0" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Quick Access</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/org-events">View All Events</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <EventSkeletons />
          ) : allEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No events found
            </div>
          ) : (
            allEvents.map((event) => (
              <Link
                href={`/org-events/${event.id}`}
                key={event.id}
                className="block"
              >
                <Card className="overflow-hidden transition-colors hover:bg-accent hover:text-accent-foreground">
                  <div className="p-4">
                    {/* Card Header with Title and Status Badge */}
                    <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarRange className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">
                            {event.name}
                          </h3>
                          {event.majorEvent && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-600 border-amber-200 flex items-center"
                            >
                              <StarIcon className="h-3 w-3 mr-1 fill-amber-500" />
                              Major Event
                            </Badge>
                          )}
                        </div>
                        {/* Date displayed in user-friendly format */}
                        <div className="text-sm text-muted-foreground font-medium">
                          {formatDate(event.date)}
                        </div>
                      </div>
                      <Badge
                        variant={
                          event.status === "ongoing" ? "default" : "secondary"
                        }
                        className="ml-auto"
                      >
                        {event.status === "ongoing" ? "Ongoing" : "Upcoming"}
                      </Badge>
                    </div>

                    {/* Card Content in a 2-column grid for larger screens */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      {/* Location */}
                      <div className="flex items-start">
                        <MapPinIcon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>

                      {/* Attendees */}
                      <div className="flex items-start">
                        <UsersIcon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {event.status === "ongoing"
                            ? `${event.attendees || 0} attendees`
                            : "Not started"}
                        </span>
                      </div>

                      {/* Time Schedule spans both columns */}
                      <div className="col-span-1 sm:col-span-2 mt-1 border-t pt-2">
                        <div className="flex items-start">
                          <ClockIcon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium block mb-1">
                              Time schedule
                            </span>
                            <div className="pl-1 space-y-1">
                              {getTimeDisplay(
                                event.timeInStart ?? null,
                                event.timeInEnd ?? null,
                                event.timeOutStart ?? null,
                                event.timeOutEnd ?? null
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
