import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ongoingEvents, upcomingEvents } from "../data";

// Define type for time range
type TimeRange = {
  start: string;
  end: string;
} | null;

export function ShortcutLinks() {
  const allEvents = [...ongoingEvents, ...upcomingEvents].slice(0, 3);

  // Format time to 12-hour format
  const formatTime = (time: string | null) => {
    if (!time) return null;

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Format time range
  const formatTimeRange = (timeRange: TimeRange) => {
    if (!timeRange) return null;
    return `${formatTime(timeRange.start)} - ${formatTime(timeRange.end)}`;
  };

  // Function to display the time information with proper terminology
  const getTimeDisplay = (timeIn: TimeRange, timeOut: TimeRange) => {
    if (timeIn && timeOut) {
      return (
        <>
          <div>Time-in: {formatTimeRange(timeIn)}</div>
          <div>Time-out: {formatTimeRange(timeOut)}</div>
        </>
      );
    } else if (timeIn && !timeOut) {
      return <div>Time-in only: {formatTimeRange(timeIn)}</div>;
    } else if (!timeIn && timeOut) {
      return <div>Time-out only: {formatTimeRange(timeOut)}</div>;
    } else {
      return "No time set";
    }
  };

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
          {allEvents.map((event) => (
            <Link
              href={`/org-events/${event.id}`}
              key={event.id}
              className="block"
            >
              <Card className="overflow-hidden transition-colors hover:bg-accent hover:text-accent-foreground">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge
                      variant={
                        event.status === "ongoing" ? "default" : "secondary"
                      }
                    >
                      {event.status === "ongoing" ? "Ongoing" : "Upcoming"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="mr-2 h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex flex-col ml-6">
                      <div className="flex items-center mb-0.5">
                        <ClockIcon className="mr-2 h-4 w-4 -ml-6" />
                        <span className="font-medium">Time schedule:</span>
                      </div>
                      {getTimeDisplay(event.timeIn, event.timeOut)}
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="mr-2 h-4 w-4" />
                      <span>
                        {event.status === "upcoming"
                          ? "Not started"
                          : `${event.attendees} attendees`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
