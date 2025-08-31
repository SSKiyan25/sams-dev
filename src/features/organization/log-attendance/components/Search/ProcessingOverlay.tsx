import { Loader2Icon } from "lucide-react";

interface ProcessingOverlayProps {
  type: "time-in" | "time-out";
  showNames: boolean;
  studentName?: string;
}

export function ProcessingOverlay({
  type,
  showNames,
  studentName,
}: ProcessingOverlayProps) {
  const action = type === "time-in" ? "Checking in" : "Checking out";
  const studentText = showNames && studentName ? studentName : "Student";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
          </div>

          <h3 className="text-xl font-semibold mb-2">Processing Attendance</h3>

          <p className="text-muted-foreground mb-4">
            {action} {studentText}. Please wait while we record the attendance.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></span>
            <span className="inline-block h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150"></span>
            <span className="inline-block h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
