"use client";

import { useEffect, useState } from "react";
import {
  Member,
  Faculty,
  Program,
  MemberData,
} from "@/features/organization/members/types";
import { MemberForm } from "@/features/organization/members/components/MemberForm";
import { DeleteConfirmationDialog } from "@/features/organization/members/components/DeleteConfirmationDialog";
import { BulkImportDialog } from "@/features/organization/members/components/BulkImportDialog";
import { Button } from "@/components/ui/button";
import { MembersList } from "@/features/organization/members/components/MembersList";
import { MembersSkeleton } from "@/features/organization/members/components/MembersSkeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, LayoutGrid, List, Upload, Plus } from "lucide-react";
import {
  addUser,
  deleteUser,
  getFaculties,
  getPrograms,
  getUsers,
  updateUser,
} from "@/firebase";
import { toast } from "sonner";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedMembers, fetchedFaculties, fetchedPrograms] =
        await Promise.all([getUsers(), getFaculties(), getPrograms()]);
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

  const handleBulkImport = (file: File) => {
    // This would normally connect to backend processing
    // For now, we'll just show a success message
    toast.success(`File "${file.name}" ready for import.`, {
      description: "Backend processing not implemented in this demo.",
    });
  };

  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.name : "N/A";
  };

  const getFacultyName = (facultyId: string) => {
    const faculty = faculties.find((f) => f.id === facultyId);
    return faculty ? faculty.name : "N/A";
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Member Management
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or delete member records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="border rounded-md p-1 flex">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setViewMode("list")}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>

          {/* Bulk Import Button */}
          <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>

          {/* Add Member Button */}
          <Button onClick={handleAddMember}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {isLoading ? (
        <MembersSkeleton />
      ) : viewMode === "list" ? (
        <MembersList
          members={members}
          programs={programs}
          faculties={faculties}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((memberData) => (
              <TableRow key={memberData.id}>
                <TableCell>{memberData.member?.firstName}</TableCell>
                <TableCell>{memberData.member?.lastName}</TableCell>
                <TableCell>
                  {getProgramName(memberData.member?.programId)}
                  {memberData.member?.yearLevel &&
                    `-${memberData.member.yearLevel}`}
                </TableCell>
                <TableCell>
                  {getFacultyName(memberData.member?.facultyId)}
                </TableCell>
                <TableCell>{memberData.member?.studentId}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditMember(memberData)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMember(memberData)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      />
    </div>
  );
}
