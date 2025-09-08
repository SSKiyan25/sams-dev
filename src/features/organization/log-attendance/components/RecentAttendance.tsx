import { useEffect, useState, useCallback } from "react";
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
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 6; 

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
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load recent attendance:", error);
      setRecords([]);
      setIsLoading(false);
    }
  }, [eventId, type]);

  useEffect(() => {
    loadAttendance();

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(loadAttendance, 30000);

    return () => clearInterval(intervalId);
  }, [loadAttendance]);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "Not recorded";
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Show only the records for the current page
  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const visibleRecords = records.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Determine the attendees page URL
  const attendeesUrl = organizationId
    ? `/organization/${organizationId}/events/${eventId}/attendance`
    : `/org-events/${eventId}/attendance`;

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Recent {type === "time-in" ? "Time-Ins" : "Time-Outs"}
          </h3>
          <p className="font-nunito-sans text-base text-gray-600 dark:text-gray-400">
            Students who have recently{" "}
            {type === "time-in" ? "timed in" : "timed out"} for this event
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="h-9 flex-1 sm:flex-none font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === "grid" ? (
              <>
                <List className="h-3.5 w-3.5 mr-2" />
                List View
              </>
            ) : (
              <>
                <Grid3X3 className="h-3.5 w-3.5 mr-2" />
                Grid View
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadAttendance}
            className="h-9 flex-1 sm:flex-none font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-2" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNames(!showNames)}
            className="h-9 flex-1 sm:flex-none font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <LoaderIcon className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-nunito text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No {type === "time-in" ? "time-ins" : "time-outs"} recorded yet
          </h4>
          <p className="font-nunito-sans text-gray-600 dark:text-gray-400">
            Attendance records will appear here once students start checking {type === "time-in" ? "in" : "out"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main content area with flexible height */}
          <div className="flex flex-col flex-1">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                {visibleRecords.map((record) => (
                  <div
                    key={record.id}
                    className="h-32 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors shadow-sm flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 bg-primary/10 text-primary border border-gray-200 dark:border-gray-700">
                        <AvatarFallback className="font-nunito-sans font-semibold">
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
                        <p className="font-nunito font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {showNames
                            ? record.student.firstName +
                              " " +
                              record.student.lastName
                            : "Student"}
                        </p>
                        <p className="font-nunito-sans text-sm text-gray-600 dark:text-gray-400 truncate">
                          ID: {record.student.studentId}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 flex items-center font-nunito-sans font-semibold"
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-auto">
                      <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                      <span className="font-nunito-sans font-medium">{formatTime(record.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {visibleRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-gray-200 dark:border-gray-700">
                          <AvatarFallback className="font-nunito-sans font-semibold text-sm">
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
                          <div className="flex items-center gap-3">
                            <p className="font-nunito font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {showNames
                                ? record.student.firstName +
                                  " " +
                                  record.student.lastName
                                : "Student"}
                            </p>
                            <p className="font-nunito-sans text-sm text-gray-600 dark:text-gray-400">
                              ID: {record.student.studentId}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                          <span className="font-nunito-sans font-medium">{formatTime(record.timestamp)}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 flex items-center font-nunito-sans font-semibold"
                        >
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0 font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* View All Attendees Button */}
          {!isLoading && (
            <div className="flex justify-center pt-4">
              <Button asChild variant="outline" className="font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Link href={attendeesUrl}>
                  <UsersIcon className="h-4 w-4 mr-2" />
                  View All Attendees ({totalRecords})
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
