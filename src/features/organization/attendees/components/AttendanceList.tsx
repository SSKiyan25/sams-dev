import { Badge } from "@/components/ui/badge";
import { EventAttendance } from "../../log-attendance/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Timer,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProgramById } from "@/firebase";
import { Program } from "../../members/types";
import { useEffect, useState } from "react";

// --- NEW COMPONENT ---
// This component is responsible for fetching and displaying the program name for a single student.
// It manages its own state and data fetching, preventing the infinite loop.
function ProgramBadge({ programId }: { programId: string }) {
  const [programName, setProgramName] = useState("Loading...");

  useEffect(() => {
    // useEffect runs after the component renders, preventing the infinite loop.
    // The dependency array [programId] ensures this effect only runs when the programId changes.
    const fetchProgramName = async () => {
      try {
        const result = (await getProgramById(programId)) as unknown as Program;
        setProgramName(result?.name || "Unknown Program");
      } catch (error) {
        console.error("Error fetching program:", error);
        setProgramName("Unknown Program"); // Set a fallback name on error
      }
    };

    fetchProgramName();
  }, [programId]); // Dependency array is crucial here

  return (
    <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
      {programName}
    </Badge>
  );
}

// --- REFACTORED PARENT COMPONENT ---
interface AttendanceListProps {
  attendees: EventAttendance[];
}

export function AttendanceList({ attendees }: AttendanceListProps) {
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "Not recorded";
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700/50 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg shadow-blue-100/50 dark:shadow-gray-900/20">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-nunito text-xl font-bold text-gray-900 dark:text-gray-100">
                Attendance Records
              </h3>
              <p className="font-nunito-sans text-sm text-gray-600 dark:text-gray-400">
                {attendees.length} total attendees
              </p>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="flex flex-wrap gap-3">
            {/* <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {completeAttendance} Complete
              </span>
            </div> */}
            {/* Legend */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    Time-In
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="h-5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    Time-Out
                  </span>
                </div>
              </div>
            </div>
            {/* <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
              <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {checkedInOnly} Checked In
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {attendees.length > 0 ? (
        <div className="p-6">
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3">
              {attendees.map(({ student, timeIn, timeOut }) => {
                return (
                  <div
                    key={student.studentId}
                    className="group relative p-4 rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/60 hover:border-gray-300/80 dark:hover:border-gray-600/80 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-nunito font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {student.firstName} {student.lastName}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {student.studentId}
                            </span>
                            <ProgramBadge programId={student.programId} />
                          </div>
                        </div>
                      </div>

                      {/* Time Records */}
                      <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                        {/* Check-in Badge */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`flex items-center h-8 px-3 font-medium ${
                              timeIn
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
                                : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-700"
                            }`}
                          >
                            <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="text-xs whitespace-nowrap">
                              {formatTime(timeIn) || "Not recorded"}
                            </span>
                          </Badge>
                        </div>

                        {/* Check-out Badge */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`flex items-center h-8 px-3 font-medium ${
                              timeOut
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                                : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-700"
                            }`}
                          >
                            <ArrowLeft className="h-3 w-3 mr-2 flex-shrink-0" />
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="text-xs whitespace-nowrap">
                              {formatTime(timeOut) || "Not recorded"}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h4 className="font-nunito font-semibold text-gray-900 dark:text-gray-100 mb-1">
                No attendance records
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Attendance data will appear here once students check in
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
