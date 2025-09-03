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
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { Event } from "../types";
import { formatDate } from "@/utils/useGeneralUtils";

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
    timeEnd: string | null
  ) => {
    if (!timeStart || !timeEnd) return null;
    return `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;
  };

  // Function to display the time information with proper terminology
  const getTimeDisplay = () => {
    const { timeInStart, timeInEnd, timeOutStart, timeOutEnd } = event;

    const hasTimeIn = timeInStart && timeInEnd;
    const hasTimeOut = timeOutStart && timeOutEnd;

    if (hasTimeIn && hasTimeOut) {
      return (
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="text-xs font-medium mr-1">Time-in:</span>
            {formatTimeRange(timeInStart, timeInEnd)}
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium mr-1">Time-out:</span>
            {formatTimeRange(timeOutStart, timeOutEnd)}
          </div>
        </div>
      );
    } else if (hasTimeIn) {
      return (
        <div>
          <span className="text-xs font-medium mr-1">Time-in only:</span>
          {formatTimeRange(timeInStart, timeInEnd)}
        </div>
      );
    } else if (hasTimeOut) {
      return (
        <div>
          <span className="text-xs font-medium mr-1">Time-out only:</span>
          {formatTimeRange(timeOutStart, timeOutEnd)}
        </div>
      );
    } else {
      return <span className="text-muted-foreground">No time set</span>;
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
    <Card className="overflow-hidden pt-8">
      <CardHeader className="space-y-1 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <CardTitle className="text-lg leading-tight mr-1">
                {event.name}
              </CardTitle>
              {event.majorEvent && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-600 border-amber-200 flex items-center h-5"
                >
                  <StarIcon className="h-3 w-3 mr-1 fill-amber-500" />
                  <span className="text-xs">Major</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="mr-1.5 h-3 w-3 flex-shrink-0" />
              {formatDate(event.date)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant()} className="h-6">
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
        <div className="border-t" />
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <div className="flex items-start">
          <MapPinIcon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm">{event.location}</span>
        </div>

        <div className="flex items-start">
          <ClockIcon className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="text-sm">{getTimeDisplay()}</div>
        </div>

        <div className="flex items-center">
          <UsersIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm">
            {event.status === "upcoming"
              ? "Not started"
              : `${event.attendees} attendees`}
          </span>
        </div>

        {event.note && (
          <div className="border-t pt-2 mt-2 text-xs">
            <span className="font-medium">Note:</span> {event.note}
          </div>
        )}

        {/* Action Buttons */}
        {event.status !== "upcoming" && (
          <div className="flex flex-col sm:flex-row gap-2 pt-1 mt-2 w-full justify-center">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 w-full sm:w-40 justify-center"
            >
              <Link href={`/org-events/${event.id}/attendees`}>
                <UsersIcon className="mr-1.5 h-4 w-4" />
                View Attendees
              </Link>
            </Button>

            {event.status === "ongoing" && (
              <Button
                asChild
                size="sm"
                className="h-10 w-full sm:w-40 justify-center"
              >
                <Link href={`/org-events/${event.id}/log-attendance`}>
                  <UserPlusIcon className="mr-1.5 h-4 w-4" />
                  Log Attendance
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
