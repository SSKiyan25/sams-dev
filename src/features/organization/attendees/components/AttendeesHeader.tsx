import { Button } from "@/components/ui/button";
import { Event } from "../../events/types";
import { UserPlus, Upload } from "lucide-react";
import Link from "next/link";

interface AttendeesHeaderProps {
  event: Event;
  onImport: () => void;
}

export function AttendeesHeader({ event, onImport }: AttendeesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 className="text-lg font-semibold">Attendees</h2>

      <div className="flex flex-wrap w-full sm:w-auto gap-2">
        {/* Show Log Attendance button only if event is ongoing */}
        {event.status === "ongoing" && (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/org-events/${event.id}/log-attendance`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Log Attendance
            </Link>
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onImport}
          className="w-full sm:w-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>
    </div>
  );
}
