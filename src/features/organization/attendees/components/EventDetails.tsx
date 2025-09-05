import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event } from "../../events/types";
import { formatDate } from "@/utils/useGeneralUtils";

interface EventDetailsProps {
  event: Event;
  attendeeCount: number;
}

export function EventDetails({ event, attendeeCount }: EventDetailsProps) {
  // Format time to 12-hour format
  const formatTime = (time: string | null | undefined) => {
    if (!time) return null;

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Format time range
  const formatTimeRange = (
    timeStart: string | null | undefined,
    timeEnd: string | null | undefined
  ) => {
    if (!timeStart || !timeEnd) return null;
    return `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;
  };

  // Function to display the time information
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

  // Get badge variant based on status
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

  return (
    <Card>
      <CardContent className="pt-6 pb-5">
        <div className="flex flex-wrap gap-3 justify-between items-start mb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">{event.name}</h1>
              {event.majorEvent && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-600 border-amber-200 flex items-center"
                >
                  <StarIcon className="h-3 w-3 mr-1 fill-amber-500" />
                  <span className="text-xs">Major Event</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1.5 h-3 w-3 flex-shrink-0" />
              {formatDate(event.date)}
            </div>
          </div>

          <Badge variant={getBadgeVariant()} className="h-6">
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>

        {/* Divider */}
        <div className="border-t my-3" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <span className="text-sm">{attendeeCount} attendees</span>
          </div>
        </div>

        {event.note && (
          <div className="mt-3 pt-3 border-t text-sm">
            <span className="font-medium">Note:</span> {event.note}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
