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
import { ViewToggle, ViewMode } from "./ViewToggle";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EventsFiltersProps {
  onSetDate: (date: Date | undefined) => void;
  onSortBy: (sortBy: string) => void;
  disabled?: boolean;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export function EventsFilters({
  onSetDate,
  onSortBy,
  disabled = false,
  viewMode,
  onViewChange,
}: EventsFiltersProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  // Check if screen is mobile - hide view toggle on mobile
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    onSetDate(date);
  };

  const handleSortByChange = (sortBy: string) => {
    setSortBy(sortBy);
    onSortBy(sortBy);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Filter & Sort Events
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Refine your event list with filters and sorting options
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* View Toggle - Only show on desktop */}
          {isDesktop && (
            <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
          )}

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" 
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "MMM dd, yyyy") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
              {date && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handleDateChange(undefined)}
                  >
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Sort Selector */}
          <Select
            value={sortBy}
            onValueChange={handleSortByChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-[180px] h-9 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">(Date) Newest first</SelectItem>
              <SelectItem value="date-asc">(Date) Oldest first</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="attendees-desc">Most attendees</SelectItem>
              <SelectItem value="attendees-asc">Least attendees</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear All Filters */}
          {/*(date || sortBy !== "date-desc") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleDateChange(undefined);
                handleSortByChange("date-desc");
              }}
              disabled={disabled}
              className="text-xs h-9 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </Button>
          )*/}
        </div>
      </div>
    </div>
  );
}
