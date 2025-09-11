import { useState, useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { RecentAttendance } from "./RecentAttendance";
import { Event } from "../../events/types";
import { check } from "zod";
import { checkLogAttendanceExist } from "@/firebase";
import { toast } from "sonner";

interface AttendanceInterfaceProps {
  event: Event;
  onLogAttendance: (
    studentId: string,
    type: "time-in" | "time-out"
  ) => Promise<void>;
}

export function AttendanceInterface({
  event,
  onLogAttendance,
}: AttendanceInterfaceProps) {
  // Determine available attendance types
  const hasTimeIn = !!event.timeInStart && !!event.timeInEnd;
  const hasTimeOut = !!event.timeOutStart && !!event.timeOutEnd;

  // Set default active tab based on available options
  const defaultTab = hasTimeIn ? "time-in" : "time-out";
  const [activeTab, setActiveTab] = useState<"time-in" | "time-out">(
    defaultTab
  );

  // Update tab if current selection becomes invalid
  useEffect(() => {
    if (
      (!hasTimeIn && activeTab === "time-in") ||
      (!hasTimeOut && activeTab === "time-out")
    ) {
      setActiveTab(hasTimeIn ? "time-in" : "time-out");
    }
  }, [hasTimeIn, hasTimeOut, activeTab]);

  // Handle the form submission
  const handleSubmit = async (studentId: string) => {
    await onLogAttendance(studentId, activeTab);
  };

  return (
    <div className="space-y-6">
      {/* Attendance Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
        <AttendanceForm
          event={event}
          type={activeTab}
          onSubmit={handleSubmit}
          hasTimeIn={hasTimeIn}
          hasTimeOut={hasTimeOut}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6">
        <RecentAttendance eventId={event.id.toString()} type={activeTab} />
      </div>
    </div>
  );
}
