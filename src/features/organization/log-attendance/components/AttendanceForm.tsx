import { useState } from "react";
import { Event } from "@/features/organization/events/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ClipboardCheckIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  XCircleIcon,
} from "lucide-react";
import {
  findStudentById,
  findStudentsByName,
  isValidStudentId,
  StudentBasicInfo,
} from "../data";
import { AddStudentDialog } from "./AddStudentDialog";

// Seach related components and elements
import { AlternativeCheckInMethods } from "./Search/AlternativeCheckInMethods";
import { LoadingOverlay } from "./Search/LoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchByIdForm } from "./Search/SearchByIdForm";
import { SearchByNameForm } from "./Search/SearchByNameForm";
import { StudentDetails } from "./Search/StudentDetails";
import { NoStudentFound } from "./Search/NoStudentFound";
import { ProcessingOverlay } from "./Search/ProcessingOverlay";

import { toast } from "sonner";

interface AttendanceFormProps {
  event: Event;
  type: "time-in" | "time-out";
  onSubmit: (studentId: string) => Promise<void>;
}

export function AttendanceForm({ event, type, onSubmit }: AttendanceFormProps) {
  const [studentId, setStudentId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    status:
      | "idle"
      | "loading"
      | "success"
      | "error"
      | "not-found"
      | "invalid-format";
    student: StudentBasicInfo | null;
  }>({
    status: "idle",
    student: null,
  });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [searchMethod, setSearchMethod] = useState<"id" | "name">("id");
  const [nameSearchResults, setNameSearchResults] = useState<
    StudentBasicInfo[]
  >([]);

  // Handle ID search
  const handleIdSearch = async () => {
    if (!studentId.trim()) return;

    // First validate the format
    if (!isValidStudentId(studentId)) {
      setSearchResult({ status: "invalid-format", student: null });
      toast.error("Invalid student ID format");
      return;
    }

    setSearchResult({ status: "loading", student: null });
    setIsLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      const student = findStudentById(studentId);

      if (student) {
        setSearchResult({ status: "success", student });
        toast.success("Student found");
      } else {
        setSearchResult({ status: "not-found", student: null });
        toast.error("Student not found");
      }
    } catch (error) {
      setSearchResult({ status: "error", student: null });
      toast.error("Error searching for student");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle name search
  const handleNameSearch = async () => {
    if (!searchName.trim()) return;

    setIsLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      const results = findStudentsByName(searchName);
      setNameSearchResults(results);

      if (results.length === 0) {
        toast.error(`No students found matching "${searchName}"`);
      } else {
        toast.success(
          `Found ${results.length} student${results.length !== 1 ? "s" : ""}`
        );
      }
    } catch (error) {
      console.error("Error searching by name:", error);
      toast.error("Error searching for students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSelect = (student: StudentBasicInfo) => {
    setStudentId(student.studentId);
    setSearchResult({ status: "success", student });
  };

  const handleCancelSearch = () => {
    setStudentId("");
    setSearchName("");
    setSearchResult({ status: "idle", student: null });
    setNameSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchResult.status !== "success" || !searchResult.student) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setIsProcessing(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await onSubmit(studentId);

      // Show success toast
      toast.success(
        `${
          showNames ? searchResult.student.name : "Student"
        } has successfully ${
          type === "time-in" ? "checked in" : "checked out"
        } for ${event.name}.`
      );

      // Reset form after successful submission
      setTimeout(() => {
        setStudentId("");
        setSearchName("");
        setSearchResult({ status: "idle", student: null });
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Error logging attendance:", error);
      toast.error("Failed to record attendance");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (searchMethod === "id" && searchResult.status !== "success") {
        handleIdSearch();
      } else if (searchMethod === "name") {
        handleNameSearch();
      } else if (searchResult.status === "success") {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <>
      {/* Search loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Processing check-in/out overlay */}
      {isProcessing && (
        <ProcessingOverlay
          type={type}
          showNames={showNames}
          studentName={searchResult.student?.name}
        />
      )}

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 p-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ClipboardCheckIcon className="h-5 w-5" />
            {type === "time-in" ? "Check-In" : "Check-Out"} Station
          </CardTitle>
          <CardDescription>
            {type === "time-in"
              ? "Record student attendance for this event"
              : "Record student departure from this event"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNames(!showNames)}
              className="h-8"
            >
              {showNames ? (
                <>
                  <EyeOffIcon className="h-4 w-4 mr-2" />
                  Hide Names
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Show Names
                </>
              )}
            </Button>
          </div>

          {/* Main check-in form with tabs */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <Tabs
                defaultValue="id"
                onValueChange={(value) =>
                  setSearchMethod(value as "id" | "name")
                }
              >
                <TabsList className="grid w-full grid-cols-2 mb-6 gap-2">
                  <TabsTrigger value="id" className="flex items-center gap-1.5">
                    By Student ID
                  </TabsTrigger>
                  <TabsTrigger
                    value="name"
                    className="flex items-center gap-1.5"
                  >
                    By Name
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="id">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <SearchByIdForm
                        studentId={studentId}
                        setStudentId={setStudentId}
                        handleSearch={handleIdSearch}
                        isSubmitting={isSubmitting}
                        searchStatus={searchResult.status}
                        handleKeyDown={handleKeyDown}
                        successMessage={null}
                        showLabel={true}
                      />
                    </div>

                    {searchResult.status === "success" &&
                      searchResult.student && (
                        <div className="border rounded-lg p-4">
                          <StudentDetails
                            student={searchResult.student}
                            showNames={showNames}
                            isSubmitting={isSubmitting}
                            type={type}
                            buttonVariant="success"
                            onCancel={handleCancelSearch}
                          />
                        </div>
                      )}

                    {/* Use NoStudentFound component */}
                    {searchResult.status === "not-found" && (
                      <NoStudentFound
                        searchTerm={studentId}
                        searchType="id"
                        onAddStudent={() => setIsAddStudentOpen(true)}
                      />
                    )}

                    {/* Show error state */}
                    {searchResult.status === "error" && (
                      <Alert variant="destructive">
                        <AlertCircleIcon className="h-4 w-4" />
                        <AlertDescription>
                          An error occurred while searching for the student.
                          Please try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </form>
                </TabsContent>

                <TabsContent value="name">
                  <SearchByNameForm
                    searchName={searchName}
                    setSearchName={setSearchName}
                    handleSearch={handleNameSearch}
                    handleKeyDown={handleKeyDown}
                    isSubmitting={isSubmitting}
                    nameSearchResults={nameSearchResults}
                    showNames={showNames}
                    onStudentSelect={handleNameSelect}
                    showLabel={true}
                    enhancedResults={true}
                  />

                  {/* Use NoStudentFound component when no results */}
                  {nameSearchResults.length === 0 &&
                    searchName.trim() !== "" && (
                      <div className="mt-4">
                        <NoStudentFound
                          searchTerm={searchName}
                          searchType="name"
                          onAddStudent={() => setIsAddStudentOpen(true)}
                        />
                      </div>
                    )}

                  {/* Show cancel button when results are shown */}
                  {nameSearchResults.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelSearch}
                        className="h-9"
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Clear Results
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Alternative check-in methods in a separate component */}
            <AlternativeCheckInMethods />
          </div>
        </CardContent>

        <AddStudentDialog
          open={isAddStudentOpen}
          onOpenChange={setIsAddStudentOpen}
          suggestedId={studentId}
          onStudentAdded={(student) => {
            setSearchResult({ status: "success", student });
            setIsAddStudentOpen(false);
            toast.success("Student added successfully");
          }}
        />
      </Card>
    </>
  );
}
