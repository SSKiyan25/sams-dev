import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, ArrowRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "../../utils";
import { Member } from "@/features/organization/members/types";

interface SearchByNameFormProps {
  searchName: string;
  setSearchName: (name: string) => void;
  handleSearch: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isSubmitting: boolean;
  nameSearchResults: Member[];
  showNames: boolean;
  onStudentSelect: (student: Member) => void;
  showLabel?: boolean;
  enhancedResults?: boolean;
}

export function SearchByNameForm({
  searchName,
  setSearchName,
  handleSearch,
  handleKeyDown,
  isSubmitting,
  nameSearchResults,
  showNames,
  onStudentSelect,
  showLabel = false,
  enhancedResults = false,
}: SearchByNameFormProps) {
  return (
    <div className="space-y-4">
      <div>
        {showLabel && (
          <label
            htmlFor="student-name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
          >
            Search by Name
          </label>
        )}
        <div className="flex space-x-2">
          <Input
            id="student-name"
            placeholder="Enter student name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSubmitting || !searchName.trim()}
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {nameSearchResults.length > 0 &&
        (enhancedResults ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 text-sm font-medium">
              {nameSearchResults.length} result
              {nameSearchResults.length !== 1 ? "s" : ""} found
            </div>
            <div className="divide-y">
              {nameSearchResults.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center p-3 hover:bg-accent/5 cursor-pointer transition-colors"
                  onClick={() => onStudentSelect(student)}
                >
                  <Avatar className="h-10 w-10 mr-3 bg-primary/10 text-primary">
                    <AvatarFallback>
                      {showNames
                        ? getInitials(
                            student.firstName + " " + student.lastName
                          )
                        : "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {showNames
                        ? student.firstName + " " + student.lastName
                        : "Student"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {student.studentId}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {nameSearchResults.map((student) => (
              <Button
                key={student.studentId}
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => onStudentSelect(student)}
              >
                {showNames
                  ? student.firstName + " " + student.lastName
                  : "Student"}{" "}
                (ID: {student.studentId})
              </Button>
            ))}
          </div>
        ))}
    </div>
  );
}
