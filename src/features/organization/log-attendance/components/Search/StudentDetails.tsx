import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentBasicInfo } from "../../data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react";
import { getInitials } from "../../utils";

interface StudentDetailsProps {
  student: StudentBasicInfo;
  showNames: boolean;
  isSubmitting: boolean;
  type: "time-in" | "time-out";
  buttonVariant?: "default" | "success";
  onCancel?: () => void;
}

export function StudentDetails({
  student,
  showNames,
  isSubmitting,
  type,
  buttonVariant = "default",
  onCancel,
}: StudentDetailsProps) {
  const buttonClasses =
    buttonVariant === "success"
      ? "bg-green-600 hover:bg-green-700 text-white"
      : "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-12 w-12 bg-primary/10 text-primary">
          <AvatarFallback>
            {showNames ? getInitials(student.name) : "ST"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">
              {showNames ? student.name : "Student"}
            </h3>
            <Badge variant="outline">ID: {student.studentId}</Badge>
          </div>
          {showNames && (
            <p className="text-sm text-muted-foreground truncate">
              {student.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        {onCancel && !isSubmitting && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 sm:flex-none ${buttonClasses} ${
            isSubmitting ? "opacity-80" : ""
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {type === "time-in" ? "Check In" : "Check Out"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
