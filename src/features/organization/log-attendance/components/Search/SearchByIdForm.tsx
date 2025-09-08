import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { StudentIdInput } from "@/components/ui/student-id-input";

interface SearchByIdFormProps {
  studentId: string;
  setStudentId: (id: string) => void;
  handleSearch: () => void;
  handleAutoSearch?: () => void; // Optional auto-search for completion
  isSubmitting: boolean;
  searchStatus:
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "not-found"
    | "invalid-format";
  successMessage: string | null;
  showLabel?: boolean;
}

export function SearchByIdForm({
  studentId,
  setStudentId,
  handleSearch,
  handleAutoSearch,
  isSubmitting,
  searchStatus,
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
          className="font-nunito-sans text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3"
        >
          Enter Student ID
        </label>
      )}
      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
        <StudentIdInput
          value={studentId}
          onChange={setStudentId}
          onComplete={handleAutoSearch || handleSearch}
          disabled={isDisabled}
          className="flex-1"
          autoFocus
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isDisabled || !studentId.trim()}
          className="h-10 px-6 font-nunito-sans font-semibold bg-primary hover:bg-primary/90 shadow-sm w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></span>
              Checking
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <SearchIcon className="h-4 w-4 mr-2" />
              Find
            </span>
          )}
        </Button>
      </div>
      {/* {searchStatus === "invalid-format" && (
        <p className="font-nunito-sans text-sm text-red-600 dark:text-red-400 mt-2">
          Please enter a valid student ID format.
        </p>
      )} */}
    </div>
  );
}
