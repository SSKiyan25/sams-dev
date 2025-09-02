import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { RecentAttendance } from "./RecentAttendance";
import { Event } from "../../events/types";

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

  // If only one type is available, don't show tabs
  if ((!hasTimeIn || !hasTimeOut) && (hasTimeIn || hasTimeOut)) {
    const type = hasTimeIn ? "time-in" : "time-out";
    const title = type === "time-in" ? "Time-In" : "Time-Out";

    return (
      <>
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">{title} Attendance</h2>
          <AttendanceForm event={event} type={type} onSubmit={handleSubmit} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Recent {title} Activity
          </h2>
          <RecentAttendance eventId={event.id.toString()} type={type} />
        </div>
      </>
    );
  }

  // If Both time-in and time-out are available, show tabs
  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "time-in" | "time-out")}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="time-in">Time-In</TabsTrigger>
          <TabsTrigger value="time-out">Time-Out</TabsTrigger>
        </TabsList>

        <TabsContent value="time-in" className="mt-4">
          <AttendanceForm
            event={event}
            type="time-in"
            onSubmit={handleSubmit}
          />
        </TabsContent>

        <TabsContent value="time-out" className="mt-4">
          <AttendanceForm
            event={event}
            type="time-out"
            onSubmit={handleSubmit}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Recent {activeTab.replace("-", " ")} Activity
        </h2>
        <RecentAttendance eventId={event.id.toString()} type={activeTab} />
      </div>
    </>
  );
}
