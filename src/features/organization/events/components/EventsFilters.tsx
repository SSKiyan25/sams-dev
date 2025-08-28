import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useState } from "react";

export function EventsFilters() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("date-desc");

  return (
    <div className="flex flex-wrap gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {date ? format(date, "PPP") : "Filter by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
          {date && (
            <div className="p-3 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setDate(undefined)}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Newest first</SelectItem>
          <SelectItem value="date-asc">Oldest first</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="attendees-desc">Most attendees</SelectItem>
          <SelectItem value="attendees-asc">Least attendees</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
