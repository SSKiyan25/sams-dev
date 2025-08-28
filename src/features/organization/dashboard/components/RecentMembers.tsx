import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { recentMembers } from "../data";

export function RecentMembers() {
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Recently Added Members</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/org-members">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={member.imageUrl} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {member.name}
                </p>
                <p className="text-sm text-muted-foreground">{member.course}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Joined {new Date(member.dateJoined).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
