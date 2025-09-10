"use client";

import { useEffect, useState } from "react";
import { Event } from "@/features/organization/events/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ClipboardCheckIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  XCircleIcon,
  ClockIcon,
  TimerIcon,
} from "lucide-react";
import { searchUserByName, searchUserByStudentId } from "@/firebase";
import { isValidStudentId } from "../utils";
import { AddStudentDialog } from "./AddStudentDialog";

// Search related components and elements
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
import { Member } from "../../members/types";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface AttendanceFormProps {
  event: Event;
  type: "time-in" | "time-out";
  onSubmit: (studentId: string) => Promise<void>;
  hasTimeIn?: boolean;
  hasTimeOut?: boolean;
  activeTab?: "time-in" | "time-out";
  onTabChange?: (tab: "time-in" | "time-out") => void;
}

export function AttendanceForm({ 
  event, 
  type, 
  onSubmit, 
  hasTimeIn = true, 
  hasTimeOut = false, 
  activeTab, 
  onTabChange 
}: AttendanceFormProps) {
  const [studentId, setStudentId] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPerformedNameSearch, setHasPerformedNameSearch] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    status:
      | "idle"
      | "loading"
      | "success"
      | "error"
      | "not-found"
      | "invalid-format";
    student: Member | null;
  }>({
    status: "idle",
    student: null,
  });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [searchMethod, setSearchMethod] = useState<"id" | "name">("id");
  const [nameSearchResults, setNameSearchResults] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Get the auth instance
    const auth = getAuth();

    // Set up the listener and store the unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
      }
    });

    // Return the cleanup function to unsubscribe from the listener
    return () => unsubscribe();
  }, []); // The empty array ensures this effect runs only once on mount

  // Handle ID search
  const handleIdSearch = async () => {
    if (!currentUser) {
      console.error("User not authenticated.");
      toast.error("You must be signed in to perform this action.");
      return;
    }

    if (!studentId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    // Validate format and show toast errors for manual search
    if (!isValidStudentId(studentId)) {
      setSearchResult({ status: "invalid-format", student: null });
      
      // Provide helpful error messages only for manual search
      const trimmed = studentId.trim();
      if (trimmed.length < 8) {
        toast.error(`Student ID incomplete. Expected format: XX-X-XXXXX`);
      } else if (trimmed.length > 10) {
        toast.error(`Student ID too long. Expected format: XX-X-XXXXX`);
      } else if (!/^\d{2}-\d{1}-\d{5}$/.test(trimmed)) {
        toast.error(`Invalid student ID format. Expected: XX-X-XXXXX`);
      } 
      return;
    }
    await performIdSearch(true); 
  };

  // Handle auto-complete search
  const handleAutoSearch = async () => {
    if (!currentUser || !studentId.trim()) {
      return;
    }

    if (!isValidStudentId(studentId)) {
      return;
    }
    await performIdSearch(false); 
  };

  // Handle ID search triggered by auto-completion (no toast errors) - DISABLED
  // Auto-search has been disabled to prevent unwanted loading states
  
  const performIdSearch = async (showToasts: boolean = true) => {
    setSearchResult({ status: "loading", student: null });
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const student = (await searchUserByStudentId(
        studentId,
        currentUser
      )) as unknown as Member;

      if (student) {
        setSearchResult({ status: "success", student });
        if (showToasts) {
          toast.success("Student found");
        }
      } else {
        setSearchResult({ status: "not-found", student: null });
        if (showToasts) {
          toast.error("Student not found");
        }
      }
    } catch {
      setSearchResult({ status: "error", student: null });
      if (showToasts) {
        toast.error("Error searching for student");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle name search
  const handleNameSearch = async (searchTerm?: string) => {
    const nameToSearch = searchTerm || searchName;
    if (!nameToSearch || typeof nameToSearch !== 'string' || !nameToSearch.trim()) {
      setNameSearchResults([]);
      setHasPerformedNameSearch(false);
      return;
    }

    setIsSearching(true);
    setHasPerformedNameSearch(true); // Mark that a search has been performed

    try {
      // Show loading state for at least 200ms for better UX
      const [results] = await Promise.all([
        searchUserByName(nameToSearch, currentUser) as unknown as Member[],
        new Promise(resolve => setTimeout(resolve, 200))
      ]);

      console.log(results.length);
      setNameSearchResults(results as Member[]);

      // Only show toast notifications for manual search (not auto-search)
      if (!searchTerm) {
        if (results.length === 0) {
          toast.error(`No students found matching "${nameToSearch}"`);
        } else {
          toast.success(
            `Found ${results.length} student${results.length !== 1 ? "s" : ""}`
          );
        }
      }
    } catch (error) {
      console.error("Error searching by name:", error);
      toast.error("Error searching for students");
    } finally {
      setIsSearching(false);
    }
  };

  // Wrapper function for manual name search (called by button)
  const handleManualNameSearch = () => {
    handleNameSearch();
  };

  const handleNameSelect = async (student: Member) => {
    setStudentId(student.studentId);
    setSearchResult({ status: "success", student });
    // Clear the search results after selection to indicate selection was made
    setNameSearchResults([]);
    setSearchName("");
    setHasPerformedNameSearch(false); // Reset search performed state

    // Automatically submit attendance after selection
    setIsSubmitting(true);
    setIsLoading(true);
    setIsProcessing(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await onSubmit(student.studentId);

      // Show success toast
      const studentName = showNames
        ? student.firstName + " " + student.lastName
        : "Student";
      
      const getMessage = () => {
        if (event.status === "completed") {
          return `${studentName} - Special attendance logged for ${event.name}.`;
        }
        return `${studentName} has successfully ${
          type === "time-in" ? "checked in" : "checked out"
        } for ${event.name}.`;
      };
      
      toast.success(getMessage());

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

  // Handle clearing name search results when search term changes
  const handleNameSearchChange = (value: string) => {
    setSearchName(value);
    if (!value.trim()) {
      setNameSearchResults([]);
      setHasPerformedNameSearch(false);
    } else {
      // Reset search performed state when user types new characters
      setHasPerformedNameSearch(false);
    }
  };

  const handleCancelSearch = () => {
    setStudentId("");
    setSearchName("");
    setSearchResult({ status: "idle", student: null });
    setNameSearchResults([]);
    setHasPerformedNameSearch(false); // Reset search performed state
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
      const studentName = showNames
        ? searchResult.student.firstName + " " + searchResult.student.lastName
        : "Student";
      
      const getMessage = () => {
        if (event.status === "completed") {
          return `${studentName} - Special attendance logged for ${event.name}.`;
        }
        return `${studentName} has successfully ${
          type === "time-in" ? "checked in" : "checked out"
        } for ${event.name}.`;
      };
      
      toast.success(getMessage());

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
        handleManualNameSearch();
      } else if (searchResult.status === "success") {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <>
      {/* Search loading overlay - only for form submission, not for searching */}
      {isLoading && <LoadingOverlay />}

      {/* Processing check-in/out overlay */}
      {isProcessing && (
        <ProcessingOverlay
          type={type}
          showNames={showNames}
          studentName={
            searchResult.student?.firstName +
              " " +
              searchResult.student?.lastName || ""
          }
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="flex items-center gap-3 text-xl font-nunito font-bold text-gray-900 dark:text-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardCheckIcon className="h-5 w-5 text-primary" />
              </div>
              {type === "time-in" ? "Check-In" : "Check-Out"} Station
            </h3>
            <p className="font-nunito-sans text-base text-gray-600 dark:text-gray-400 mt-2">
              {type === "time-in"
                ? "Record student attendance for this event"
                : "Record student departure from this event"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNames(!showNames)}
            className="h-9 px-4 font-nunito-sans font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto"
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

        {/* Type Selection - Only show if both are available */}
        {hasTimeIn && hasTimeOut && onTabChange && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={activeTab === "time-in" ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange("time-in")}
              className="font-nunito-sans font-semibold"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Check-In
            </Button>
            <Button
              variant={activeTab === "time-out" ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange("time-out")}
              className="font-nunito-sans font-semibold"
            >
              <TimerIcon className="h-4 w-4 mr-2" />
              Check-Out
            </Button>
          </div>
        )}

        {/* Search form */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6">
          <Tabs
            defaultValue="id"
            onValueChange={(value) =>
              setSearchMethod(value as "id" | "name")
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="id" className="flex items-center gap-1.5 font-nunito-sans font-semibold">
                By Student ID
              </TabsTrigger>
              <TabsTrigger
                value="name"
                className="flex items-center gap-1.5 font-nunito-sans font-semibold"
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
                    handleAutoSearch={handleAutoSearch}
                    isSubmitting={isSubmitting}
                    searchStatus={searchResult.status}
                    successMessage={null}
                    showLabel={true}
                  />
                </div>

                {searchResult.status === "success" &&
                  searchResult.student && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
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
              <div className="space-y-4">                
                <SearchByNameForm
                  searchName={searchName}
                  setSearchName={handleNameSearchChange}
                  handleSearch={handleManualNameSearch}
                  handleKeyDown={handleKeyDown}
                  isSubmitting={isSubmitting}
                  isSearching={isSearching}
                  nameSearchResults={nameSearchResults}
                  showNames={showNames}
                  onStudentSelect={handleNameSelect}
                  showLabel={true}
                  enhancedResults={true}
                />
              </div>

              {/* Use NoStudentFound component when no results and search has been performed */}
              {nameSearchResults.length === 0 &&
                searchName.trim() !== "" &&
                hasPerformedNameSearch && (
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

        {/* Alternative check-in methods */}
        <AlternativeCheckInMethods />

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
      </div>
    </>
  );
}
