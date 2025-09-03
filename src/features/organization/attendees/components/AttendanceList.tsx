import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "../../log-attendance/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UserIcon,
  ArrowRight,
  ArrowLeft,
  RefreshCcw,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProgramName } from "../data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttendanceListProps {
  attendees: AttendanceRecord[];
  onRefresh: () => void;
}

export function AttendanceList({ attendees, onRefresh }: AttendanceListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Format program with year level
  const formatProgram = (programId: string, yearLevel?: number) => {
    const programName = getProgramName(programId);
    return yearLevel ? `${programName}-${yearLevel}` : programName;
  };

  // Group attendees by studentId
  const groupedByStudentId = attendees.reduce((groups, record) => {
    const studentId = record.student.studentId;
    if (!groups[studentId]) {
      groups[studentId] = [];
    }
    groups[studentId].push(record);
    return groups;
  }, {} as Record<string, AttendanceRecord[]>);

  // For each student, find their time-in and time-out records
  const processedAttendees = Object.values(groupedByStudentId).map(
    (records) => {
      const timeInRecord = records.find((r) => r.type === "time-in");
      const timeOutRecord = records.find((r) => r.type === "time-out");

      // Use the student from any record (they're the same)
      const student = records[0].student;

      return {
        student,
        timeIn: timeInRecord ? formatTime(timeInRecord.timestamp) : null,
        timeOut: timeOutRecord ? formatTime(timeOutRecord.timestamp) : null,
      };
    }
  );

  return (
    <Card>
      <CardHeader className="pt-4 px-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          Attendance Records
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="space-y-2 p-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Time
                  </Badge>
                  <span className="text-xs">Check-in time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Time
                  </Badge>
                  <span className="text-xs">Check-out time</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </CardTitle>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="h-5 bg-green-50 text-green-700 border-green-200"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
            </Badge>
            <span>Check-in</span>

            <Badge
              variant="outline"
              className="h-5 ml-2 bg-amber-50 text-amber-700 border-amber-200"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
            </Badge>
            <span>Check-out</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      {processedAttendees.length > 0 ? (
        <CardContent className="p-0">
          <ScrollArea className="max-h-auto">
            <div className="divide-y">
              {processedAttendees.map(({ student, timeIn, timeOut }) => (
                <div
                  key={student.studentId}
                  className="p-4 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    {/* Student info */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {student.firstName} {student.lastName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {student.studentId}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs py-0 px-1.5 h-5"
                          >
                            {formatProgram(
                              student.programId,
                              student.yearLevel
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Time badges */}
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:self-center">
                      {/* Time-in badge */}
                      <Badge
                        variant="outline"
                        className={`flex items-center h-7 px-2 ${
                          timeIn
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        <ArrowRight className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="text-xs whitespace-nowrap">
                          {timeIn || "Not recorded"}
                        </span>
                      </Badge>

                      {/* Time-out badge */}
                      <Badge
                        variant="outline"
                        className={`flex items-center h-7 px-2 ${
                          timeOut
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        <ArrowLeft className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="text-xs whitespace-nowrap">
                          {timeOut || "Not recorded"}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      ) : (
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No attendance records found</p>
        </CardContent>
      )}
    </Card>
  );
}
