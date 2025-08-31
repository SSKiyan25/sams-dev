import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "lucide-react";

interface NoStudentFoundProps {
  searchTerm: string;
  searchType: "id" | "name";
  onAddStudent: () => void;
}

export function NoStudentFound({
  searchTerm,
  searchType,
  onAddStudent,
}: NoStudentFoundProps) {
  return (
    <div className="rounded-lg border p-4 bg-muted/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h3 className="font-medium mb-1">
            {searchType === "id" ? "Student Not Found" : "No Students Found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchType === "id"
              ? `No student found with ID ${searchTerm}`
              : `No students matching "${searchTerm}"`}
          </p>
        </div>
        <Button size="sm" onClick={onAddStudent} className="w-full sm:w-auto">
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>
    </div>
  );
}
