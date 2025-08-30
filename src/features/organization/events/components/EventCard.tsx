import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { Event } from "../data";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onArchive: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventCard({
  event,
  onEdit,
  onArchive,
  onDelete,
}: EventCardProps) {
  //   const [isOpen, setIsOpen] = useState(false);

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

  // Get the appropriate badge color based on event status
  const getBadgeVariant = () => {
    switch (event.status) {
      case "ongoing":
        return "default";
      case "upcoming":
        return "secondary";
      case "completed":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleEditEvent = () => {
    onEdit(event);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{event.name}</CardTitle>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-4 w-4" />
            {new Date(event.date).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getBadgeVariant()}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditEvent}>
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  event.status === "archived"
                    ? onDelete(event)
                    : onArchive(event)
                }
                className="text-destructive"
              >
                {event.status === "archived" ? "Delete" : "Archive"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPinIcon className="mr-2 h-4 w-4 mt-0.5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-start">
                <ClockIcon className="mr-2 h-4 w-4 mt-0.5" />
                <div className="flex flex-col">
                  {getTimeDisplay(
                    event.timeInStart,
                    event.timeInEnd,
                    event.timeOutStart,
                    event.timeOutEnd
                  )}
                </div>
              </div>
              {event.note && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Note:</span> {event.note}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <UsersIcon className="mr-2 h-4 w-4" />
                <span>
                  {event.status === "upcoming"
                    ? "Not started"
                    : `${event.attendees} attendees`}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                {event.status !== "upcoming" && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 p-2"
                  >
                    <Link href={`/org-events/${event.id}/attendees`}>
                      <UsersIcon className="mr-2 h-4 w-4" />
                      View Attendees
                    </Link>
                  </Button>
                )}
                {event.status === "ongoing" && (
                  <Button asChild size="sm" className="flex-1 p-2">
                    <Link href={`/org-events/${event.id}/log-attendance`}>
                      <UserPlusIcon className="mr-2 h-4 w-4" />
                      Log Attendance
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
