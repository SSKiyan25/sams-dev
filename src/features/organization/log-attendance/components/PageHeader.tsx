import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ArrowLeftIcon, ClockIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { formatTimeRange } from "../utils";
import { Event } from "../../events/types";
import { formatDate } from "@/utils/useGeneralUtils";

interface PageHeaderProps {
  event: Event;
}

export function PageHeader({ event }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" size="icon" asChild className="h-8 w-8">
          <Link href={`/org-events`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Log Attendance</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-8">
        <div className="text-lg font-medium">{event.name}</div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="w-fit">
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>

          {event.majorEvent && (
            <Badge
              variant="default"
              className="bg-amber-500 hover:bg-amber-600"
            >
              <StarIcon className="h-3 w-3 mr-1" /> Major Event
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(event.date)}
        </div>

        <div className="flex items-center">
          <ClockIcon className="mr-2 h-4 w-4" />
          {event.timeInStart && event.timeInEnd
            ? `Time-in: ${formatTimeRange(event.timeInStart, event.timeInEnd)}`
            : "No time-in set"}
          {event.timeOutStart && event.timeOutEnd
            ? ` • Time-out: ${formatTimeRange(
                event.timeOutStart,
                event.timeOutEnd
              )}`
            : ""}
        </div>
      </div>
    </div>
  );
}
