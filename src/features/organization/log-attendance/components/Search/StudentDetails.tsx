import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react";
import { getInitials } from "../../utils";
import { Member } from "@/features/organization/members/types";

interface StudentDetailsProps {
  student: Member;
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
      ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
      : "bg-primary hover:bg-primary/90 shadow-md";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 flex-1">
        <Avatar className="h-12 w-12 bg-primary/10 text-primary border border-gray-200 dark:border-gray-700">
          <AvatarFallback className="font-nunito-sans font-semibold">
            {showNames
              ? getInitials(student.firstName + " " + student.lastName)
              : "ST"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-nunito text-lg font-bold text-gray-900 dark:text-gray-100">
              {showNames
                ? student.firstName + " " + student.lastName
                : "Student"}
            </h3>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 font-nunito-sans font-semibold">
              ID: {student.studentId}
            </Badge>
          </div>
          {showNames && (
            <p className="font-nunito-sans text-sm text-gray-600 dark:text-gray-400 truncate">
              {student.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-2 sm:mt-0">
        {onCancel && !isSubmitting && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none h-10 font-nunito-sans font-semibold border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 min-w-[100px]"
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 sm:flex-none h-10 font-nunito-sans font-semibold min-w-[120px] ${buttonClasses} ${
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
