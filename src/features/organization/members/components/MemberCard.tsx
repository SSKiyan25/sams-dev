import { MemberData, Faculty, Program } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  GraduationCap,
  Building2,
  UserCog,
  Pencil,
  Trash2,
} from "lucide-react";

interface MemberCardProps {
  memberData: MemberData;
  programs: Program[];
  faculties: Faculty[];
  onEdit: (member: MemberData) => void;
  onDelete: (member: MemberData) => void;
}

export function MemberCard({
  memberData,
  programs,
  faculties,
  onEdit,
  onDelete,
}: MemberCardProps) {
  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.name : "N/A";
  };

  const getFacultyName = (facultyId: string) => {
    const faculty = faculties.find((f) => f.id === facultyId);
    return faculty ? faculty.name : "N/A";
  };

  const getYearLevelText = (yearLevel?: number) => {
    if (!yearLevel) return "";

    // Handle ordinal suffixes
    const suffixes = ["th", "st", "nd", "rd"];
    const suffix =
      yearLevel % 100 > 10 && yearLevel % 100 < 14
        ? suffixes[0]
        : suffixes[yearLevel % 10] || suffixes[0];

    return `${yearLevel}${suffix} Year`;
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="flex p-3">
          <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <UserCircle className="h-6 w-6" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {memberData.member.firstName} {memberData.member.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {memberData.member.email || "No email provided"}
                </p>
              </div>
            </div>

            <div className="mt-2">
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center text-xs">
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="truncate">
                    {getProgramName(memberData.member.programId)}
                    {memberData.member.yearLevel && (
                      <span className="ml-1 text-muted-foreground">
                        ({getYearLevelText(memberData.member.yearLevel)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="truncate">
                    {getFacultyName(memberData.member.facultyId)}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <UserCog className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="truncate">
                    ID: {memberData.member.studentId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to push the buttons to the bottom */}
        <div className="flex-grow min-h-[10px]"></div>

        <div className="flex border-t mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-9 text-xs font-normal"
            onClick={() => onEdit(memberData)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <div className="border-r h-9" />
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-9 text-xs font-normal text-destructive hover:text-destructive"
            onClick={() => onDelete(memberData)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
