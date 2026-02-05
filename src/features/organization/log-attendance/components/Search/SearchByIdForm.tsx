import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { StudentIdInput } from "@/components/ui/student-id-input";

interface SearchByIdFormProps {
  studentId: string;
  setStudentId: (id: string) => void;
  handleSearch: () => void;
  handleAutoSearch?: () => void; // Auto-search for completion
  isSubmitting: boolean;
  searchStatus:
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "success-different-organization"
    | "success-different-faculty"
    | "not-found"
    | "invalid-format";
  successMessage: string | null;
  showLabel?: boolean;
  handleKeyDown?: (e: React.KeyboardEvent) => void;
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
  handleKeyDown,
}: SearchByIdFormProps) {
  const isLoading = searchStatus === "loading";
  const isDisabled =
    isSubmitting ||
    isLoading ||
    (searchStatus === "success" && !successMessage);

  const handleClear = () => {
    setStudentId("");
  };

  // Create a default key down handler if none is provided
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (handleKeyDown) {
      handleKeyDown(e);
    } else if (e.key === "Enter" && !isDisabled && studentId.trim()) {
      e.preventDefault();
      handleSearch();
    }
  };

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
      <div className="flex flex-col min-[1178px]:flex-row min-[1178px]:items-start min-[1178px]:space-x-2 space-y-2 min-[1178px]:space-y-0">
        <div className="flex-1">
          <StudentIdInput
            value={studentId}
            onChange={setStudentId}
            onComplete={handleAutoSearch || handleSearch}
            disabled={isDisabled}
            className="w-full"
            autoFocus
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="min-[1178px]:pt-1 flex gap-2 w-full min-[1178px]:w-auto">
          <Button
            type="button"
            onClick={handleClear}
            disabled={isDisabled || !studentId.trim()}
            variant="outline"
            className="h-10 md:h-12 px-4 md:px-6 font-nunito-sans font-semibold border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 w-auto min-[1178px]:min-w-[80px] flex-shrink-0"
          >
            <XIcon className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Clear</span>
          </Button>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isDisabled || !studentId.trim()}
            className="h-10 md:h-12 px-6 md:px-8 font-nunito-sans font-semibold bg-primary hover:bg-primary/90 shadow-sm flex-1 min-[1178px]:flex-none min-[1178px]:min-w-[120px] flex-shrink-0"
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
      </div>
    </div>
  );
}
