import { MemberData, Faculty, Program } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Pencil, Trash2, ChevronRight } from "lucide-react";

interface CompactMemberListProps {
  members: MemberData[];
  programs: Program[];
  faculties: Faculty[];
  onEdit: (member: MemberData) => void;
  onDelete: (member: MemberData) => void;
}

export function CompactMemberList({
  members,
  programs,
  onEdit,
  onDelete,
}: CompactMemberListProps) {
  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.name : "N/A";
  };

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {members.map((memberData) => (
            <li
              key={memberData.id}
              className="p-2 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                      <p className="font-medium text-sm truncate">
                        {memberData.member.firstName}{" "}
                        {memberData.member.lastName}
                      </p>
                      <div className="flex items-center">
                        <Separator
                          orientation="vertical"
                          className="h-3 mx-2 hidden sm:block"
                        />
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1 h-4"
                        >
                          {getProgramName(memberData.member.programId)}
                          {memberData.member.yearLevel
                            ? `-${memberData.member.yearLevel}`
                            : ""}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      ID: {memberData.member.studentId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(memberData)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(memberData)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
