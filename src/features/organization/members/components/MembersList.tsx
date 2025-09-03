import { useState } from "react";
import { MemberData, Faculty, Program } from "../types";
import { MemberCard } from "./MemberCard";
import { CompactMemberList } from "./CompactMemberList";
import { MembersSearch } from "./MembersSearch";
import { MembersPagination } from "./MembersPagination";

interface MembersListProps {
  members: MemberData[];
  programs: Program[];
  faculties: Faculty[];
  onEdit: (member: MemberData) => void;
  onDelete: (member: MemberData) => void;
}

const ITEMS_PER_PAGE = 12;

export function MembersList({
  members,
  programs,
  faculties,
  onEdit,
  onDelete,
}: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [viewStyle, setViewStyle] = useState<"card" | "compact">("card");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter members based on search term and filters
  const filteredMembers = members.filter((memberData) => {
    const { firstName, lastName, programId, studentId, email } =
      memberData.member;
    const searchFields = [firstName, lastName, studentId, email || ""]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchTerm === "" || searchFields.includes(searchTerm.toLowerCase());
    const matchesProgram =
      programFilter === "all" || programId === programFilter;

    return matchesSearch && matchesProgram;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleProgramFilter = (programId: string) => {
    setProgramFilter(programId);
    setCurrentPage(1);
  };

  const handleViewStyleChange = (style: "card" | "compact") => {
    setViewStyle(style);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <MembersSearch
        programs={programs}
        faculties={faculties}
        onSearch={handleSearch}
        onProgramFilter={handleProgramFilter}
        onViewStyleChange={handleViewStyleChange}
        searchTerm={searchTerm}
        programFilter={programFilter}
        viewStyle={viewStyle}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredMembers.length}{" "}
        {filteredMembers.length === 1 ? "member" : "members"} found
      </div>

      {/* Members list */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-4">
          {viewStyle === "card" ? (
            // Card view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedMembers.map((memberData) => (
                <MemberCard
                  key={memberData.id}
                  memberData={memberData}
                  programs={programs}
                  faculties={faculties}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            // Compact view
            <CompactMemberList
              members={paginatedMembers}
              programs={programs}
              faculties={faculties}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}

          {/* Pagination */}
          <MembersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className="py-12 text-center bg-muted/30 rounded-md">
          <p className="text-muted-foreground">No members found</p>
        </div>
      )}
    </div>
  );
}
