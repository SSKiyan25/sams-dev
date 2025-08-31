import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

interface SearchByIdFormProps {
  studentId: string;
  setStudentId: (id: string) => void;
  handleSearch: () => void;
  isSubmitting: boolean;
  searchStatus:
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "not-found"
    | "invalid-format";
  handleKeyDown: (e: React.KeyboardEvent) => void;
  successMessage: string | null;
  showLabel?: boolean;
}

export function SearchByIdForm({
  studentId,
  setStudentId,
  handleSearch,
  isSubmitting,
  searchStatus,
  handleKeyDown,
  successMessage,
  showLabel = false,
}: SearchByIdFormProps) {
  const isLoading = searchStatus === "loading";
  const isDisabled =
    isSubmitting ||
    isLoading ||
    (searchStatus === "success" && !successMessage);

  return (
    <div>
      {showLabel && (
        <label
          htmlFor="student-id"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
        >
          Enter Student ID
        </label>
      )}
      <div className="flex space-x-2">
        <Input
          id="student-id"
          placeholder="Enter student ID number"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isDisabled || !studentId.trim()}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></span>
              Checking
            </span>
          ) : (
            <span className="flex items-center">
              <SearchIcon className="h-4 w-4 mr-2" />
              Find
            </span>
          )}
        </Button>
      </div>
      {searchStatus === "invalid-format" && (
        <p className="text-sm text-destructive mt-2">
          Please enter a valid student ID format.
        </p>
      )}
    </div>
  );
}
