"use client";

import { useEffect, useState } from "react";
import {
  Member,
  Faculty,
  Program,
  MemberData,
  BulkImportResult,
} from "@/features/organization/members/types";
import { MemberForm } from "@/features/organization/members/components/MemberForm";
import { DeleteConfirmationDialog } from "@/features/organization/members/components/DeleteConfirmationDialog";
import { BulkImportDialog } from "@/features/organization/members/components/BulkImportDialog";
import { MembersList } from "@/features/organization/members/components/MembersList";
import { MembersTable } from "@/features/organization/members/components/MembersTable";
import { MembersSkeleton } from "@/features/organization/members/components/MembersSkeleton";
import { MembersHeader } from "@/features/organization/members/components/MembersHeader";
import { MembersFilters } from "@/features/organization/members/components/MembersFilters";
//import { MembersSearchBar } from "@/features/organization/members/components/MembersSearchBar";
import { MembersPagination } from "@/features/organization/members/components/MembersPagination";
import { ViewMode } from "@/features/organization/members/components/ViewToggle";
import {
  addUser,
  checkStudentIdExist,
  deleteUser,
  getFaculties,
  getProgramByFacultyId,
  getPrograms,
  getUsers,
  processFileForBulkImport,
  updateUser,
} from "@/firebase";
import { toast } from "sonner";
import { BulkImportResultModal } from "@/features/organization/members/components/BulkImportResultModal";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkImportOpenResult, setIsBulkImportOpenResult] = useState(false);
  const [bulkImportResult, setBulkImportResult] =
    useState<BulkImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  //MOCK DATA!!! COMMENT OUT WHEN ABOUT TO COMMIT
  // useEffect(() => {
  //   const mockResult: BulkImportResult = {
  //     success: true,
  //     successfulImports: 3,
  //     errors: [
  //       { row: 2, studentId: "22-1-00123", error: "Invalid Faculty name FACULTY OF PSEUDOSCIENCE. Available faculties:" },
  //       { row: 5, studentId: "22-1-00456", error: "Invalid Program name BS IN ENVI SCIENCE. Available programs: BS in Forestry, BS in Environmental Science, BS in Agricultural and Biosystems Engineering, BS in Computer Science, BS in Mechanical Engineering, BS in Geodetic Engineering, BS in Civil Engineering" },
  //     ],
  //     duplicates: ["S789"],
  //     totalProcessed: 0
  //   };
  //   setBulkImportResult(mockResult);
  //   setIsBulkImportOpenResult(true);
  // }, []);

  // Pagination constants
  const ITEMS_PER_PAGE_CARD = 12;
  const ITEMS_PER_PAGE_TABLE = 10;

  // Load saved view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("membersViewMode") as ViewMode;
    if (
      savedViewMode &&
      (savedViewMode === "card" || savedViewMode === "table")
    ) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage when changed
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("membersViewMode", mode);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedMembers, fetchedFaculties, fetchedPrograms] =
        await Promise.all([
          getUsers(),
          getFaculties(),
          getProgramByFacultyId(),
        ]);
      setMembers(fetchedMembers as unknown as MemberData[]);
      setFaculties(fetchedFaculties as unknown as Faculty[]);
      setPrograms(fetchedPrograms as unknown as Program[]);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load member data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member: MemberData) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleDeleteMember = (member: MemberData) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedMember) {
      try {
        setMembers(members.filter((member) => member.id !== selectedMember.id));
        await deleteUser(selectedMember.id);
        toast.success("Member deleted successfully");
      } catch (error) {
        toast.error("Failed to delete member");
        console.error(error);
        // Refetch to ensure UI is in sync with server
        fetchData();
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedMember(null);
      }
    }
  };

  const handleFormSubmit = async (data: Member) => {
    try {
      if (selectedMember) {
        await updateUser(selectedMember.id, data);
        toast.success("Member updated successfully");
      } else {
        if (await checkStudentIdExist(data.studentId)) {
          toast.error("Student ID already exists. Please use a different one.");
          return;
        }
        await addUser(data);
        toast.success("Member added successfully");
      }
      fetchData(); // Refetch data to update the list
    } catch (error) {
      toast.error(
        selectedMember ? "Failed to update member" : "Failed to add member"
      );
      console.error(error);
    } finally {
      setIsFormOpen(false);
      setSelectedMember(null);
    }
  };

  const handleBulkImport = async (file: File) => {
    setIsImporting(true);
    try {
      const result = (await processFileForBulkImport(file)) as BulkImportResult;
      setBulkImportResult(result);
      setIsBulkImportOpen(false);
      setIsBulkImportOpenResult(true);
      fetchData(); // Refresh member list after imports
    } catch (error) {
      console.error("Bulk import failed:", error);
      toast.error("Failed to process the file. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Handle search activation/deactivation
  const onSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleProgramFilter = (programId: string) => {
    setProgramFilter(programId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortBy = (sortBy: string) => {
    // Implement sorting logic here based on sortBy value
    // For example, sort by name, date added, etc.
    // This is a placeholder implementation
    const sortedMembers = [...members];
    if (sortBy === "name-asc") {
      sortedMembers.sort((a, b) =>
        a.member.firstName.localeCompare(b.member.firstName)
      );
    } else if (sortBy === "name-desc") {
      sortedMembers.sort((a, b) =>
        b.member.firstName.localeCompare(a.member.firstName)
      );
    } else if (sortBy === "id-asc") {
      sortedMembers.sort((a, b) =>
        a.member.studentId.localeCompare(b.member.studentId)
      );
    } else if (sortBy === "id-desc") {
      sortedMembers.sort((a, b) =>
        b.member.studentId.localeCompare(a.member.studentId)
      );
    } else if (sortBy === "date-desc") {
      sortedMembers.sort((a, b) => {
        const dateA = a.member.createdAt
          ? new Date(a.member.createdAt.toDate())
          : new Date(0);
        const dateB = b.member.createdAt
          ? new Date(b.member.createdAt.toDate())
          : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
    } else if (sortBy === "date-asc") {
      sortedMembers.sort((a, b) => {
        const dateA = a.member.createdAt
          ? new Date(a.member.createdAt.toDate())
          : new Date(0);
        const dateB = b.member.createdAt
          ? new Date(b.member.createdAt.toDate())
          : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    }
    setMembers(sortedMembers);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter and search members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.member.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.member.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProgram =
      programFilter === "all" || member.member.programId === programFilter;

    return matchesSearch && matchesProgram;
  });

  // Pagination
  const itemsPerPage =
    viewMode === "card" ? ITEMS_PER_PAGE_CARD : ITEMS_PER_PAGE_TABLE;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, programFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <MembersHeader
            onSearch={onSearch}
            onAddMember={handleAddMember}
            onBulkImport={() => setIsBulkImportOpen(true)}
            totalMembers={members.length}
          />
        </div>

        {/* Search results indicator */}
        {/* {isSearchActive && (
          <div className="mb-6">
            <MembersSearchBar
              searchQuery={searchQuery}
              resultsCount={filteredMembers.length}
              onClear={clearSearch}
            />
          </div>
        )} */}

        {/* Filters Section */}
        <div className="mb-6">
          <MembersFilters
            programs={programs}
            onSearch={onSearch}
            onProgramFilter={handleProgramFilter}
            onSortBy={handleSortBy}
            searchTerm={searchQuery}
            programFilter={programFilter}
            disabled={isLoading}
            viewMode={viewMode}
            onViewChange={handleViewModeChange}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {isLoading ? (
            <MembersSkeleton />
          ) : viewMode === "card" ? (
            <MembersList
              members={paginatedMembers}
              programs={programs}
              faculties={faculties}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          ) : (
            <MembersTable
              members={paginatedMembers}
              programs={programs}
              faculties={faculties}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredMembers.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            <MembersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <MemberForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          member={selectedMember}
          facultyData={faculties}
          programData={programs}
        />

        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
        />

        <BulkImportDialog
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
          onImport={handleBulkImport}
          isImporting={isImporting}
        />

        <BulkImportResultModal
          open={isBulkImportOpenResult}
          onOpenChange={setIsBulkImportOpenResult}
          result={bulkImportResult}
        />
      </div>
    </div>
  );
}
