import { Card, CardContent } from "@/components/ui/card";
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

interface EventListItemProps {
  event: Event;
  onEdit: (event: Event) => void;
  onArchive: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventListItem({
  event,
  onEdit,
  onArchive,
  onDelete,
}: EventListItemProps) {
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
          <div className="text-xs font-bold mr-2 uppercase tracking-wider min-w-[30px]">Time In: {formatTimeRange(timeInStart, timeInEnd)}</div>
          <div className="text-xs font-bold mr-2 uppercase tracking-wider min-w-[30px]">Time Out: {formatTimeRange(timeOutStart, timeOutEnd)}</div>
        </div>
      );
    } else if (hasTimeIn) {
      return <div className="text-xs font-bold mr-2 uppercase tracking-wider min-w-[30px]">Time In: {formatTimeRange(timeInStart, timeInEnd)}</div>
    } else if (hasTimeOut) {
      return <div className="text-xs font-bold mr-2 uppercase tracking-wider min-w-[30px]">Time Out: {formatTimeRange(timeOutStart, timeOutEnd)}</div>
    } else {
      return "No time set";
    }
  };

  // Get the appropriate badge color and style based on event status
  const getStatusBadge = () => {
    switch (event.status) {
      case "ongoing":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse inline-block"></span>
            Ongoing
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700 font-medium">
            <CalendarIcon className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 font-medium">
            Completed
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-gray-500 dark:text-gray-400 font-medium">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-medium">
            {String(event.status).charAt(0).toUpperCase() + String(event.status).slice(1)}
          </Badge>
        );
    }
  };

  const handleEditEvent = () => {
    onEdit(event);
  };

  // Get status-based styling for the card - unified neutral background
  const getStatusCardStyles = () => {
    // Use consistent neutral styling for all events
    return "border-blue-300 dark:border-blue-600 bg-blue-50/30 dark:bg-blue-900/10";
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-500 ${getStatusCardStyles()} overflow-hidden`}>
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-words leading-tight hyphens-auto">
                {event.name}
              </h3>
            </div>

            {/* Desktop: All badges and controls in one row */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              {/* Major Event badge */}
              {event.majorEvent && (
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-300 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400 dark:border-amber-600 px-3 py-1 font-bold text-xs shadow-sm"
                >
                  <StarIcon className="h-3 w-3 mr-1 fill-amber-600 dark:fill-amber-400" />
                  Major Event
                </Badge>
              )}
              
              {/* Status badge */}
              {getStatusBadge()}
              
              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 flex-shrink-0 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <MoreHorizontalIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-lg">
                  <DropdownMenuItem onClick={handleEditEvent} className="font-medium">
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      event.status === "archived"
                        ? onDelete(event)
                        : onArchive(event)
                    }
                    className="text-red-600 dark:text-red-400 font-medium"
                  >
                    {event.status === "archived" ? "Delete" : "Archive"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile: Just dropdown menu */}
            <div className="flex sm:hidden items-center gap-3 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 flex-shrink-0 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <MoreHorizontalIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-lg">
                  <DropdownMenuItem onClick={handleEditEvent} className="font-medium">
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      event.status === "archived"
                        ? onDelete(event)
                        : onArchive(event)
                    }
                    className="text-red-600 dark:text-red-400 font-medium"
                  >
                    {event.status === "archived" ? "Delete" : "Archive"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile: Badges below title */}
          <div className="flex flex-wrap items-center gap-2 sm:hidden mb-4">
            
            {event.majorEvent && (
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-300 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400 dark:border-amber-600 px-3 py-1 font-bold text-xs shadow-sm"
              >
                <StarIcon className="h-3 w-3 mr-1 fill-amber-600 dark:fill-amber-400" />
                Major Event
              </Badge>
            )}
            {getStatusBadge()}
          </div>
          
          {/* Date display below the main header content */}
          <div className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400">
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="break-words">{formatDate(event.date)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Content Section */}
        <div className="p-6 pt-6">
          <div className="flex flex-col gap-6">
            {/* Event attributes - Custom grid with wider schedule column on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-6">
              {/* Date */}
              {/* <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Date</p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words">{formatDate(event.date)}</span>
                </div>
              </div> */}

              {/* Time */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Schedule</p>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-relaxed break-words">
                    {getTimeDisplay()}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Location</p>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words">{event.location}</span>
                </div>
              </div>

              {/* Attendees */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Attendance</p>
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    {event.status === "upcoming"
                      ? "Not started"
                      : `${event.attendees} attendees`}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {event.note && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Additional Notes
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 break-words leading-relaxed">{event.note}</p>
                </div>
              </div>
            )}

            {/* Action Buttons - Moved to bottom */}
            {event.status !== "upcoming" && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                <div className="flex flex-col sm:flex-row gap-3 px-2 sm:px-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-12 px-6 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 justify-center border-2 flex-1 min-h-[48px]"
                  >
                    <Link href={`/org-events/${event.id}/attendees`}>
                      <UsersIcon className="mr-2 h-4 w-4" />
                      View Attendees
                    </Link>
                  </Button>

                  {event.status === "ongoing" && (
                    <Button
                      asChild
                      size="sm"
                      className="h-12 px-6 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 justify-center shadow-md hover:shadow-lg transition-all duration-200 flex-1 min-h-[48px]"
                    >
                      <Link href={`/org-events/${event.id}/log-attendance`}>
                        <UserPlusIcon className="mr-2 h-4 w-4" />
                        Log Attendance
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
