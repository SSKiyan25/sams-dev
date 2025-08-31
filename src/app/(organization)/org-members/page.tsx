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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import {
  addUser,
  deleteUser,
  getFaculties,
  getPrograms,
  getUsers,
  updateUser,
} from "@/firebase";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(
    null
  );
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const fetchData = async () => {
    const [fetchedMembers, fetchedFaculties, fetchedPrograms] =
      await Promise.all([getUsers(), getFaculties(), getPrograms()]);
    setMembers(fetchedMembers as unknown as MemberData[]);
    setFaculties(fetchedFaculties as unknown as Faculty[]);
    setPrograms(fetchedPrograms as unknown as Program[]);
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
        setMembers(members.filter((member) => member.id !== selectedMember.id));
        await deleteUser(selectedMember.id);
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleFormSubmit = async (data: Member) => {
    if (selectedMember) {
      await updateUser(selectedMember.id, data);
    } else {
      await addUser(data);
    }
    fetchData(); // Refetch data to update the table
    setIsFormOpen(false);
    setSelectedMember(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Member Management
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or delete member records.
          </p>
        </div>
        <Button onClick={handleAddMember}>Add Member</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Role</TableHead>
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
              </TableCell>
              <TableCell>
                {getFacultyName(memberData.member?.facultyId)}
              </TableCell>
              <TableCell>{memberData.member?.role}</TableCell>
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
    </div>
  );
}