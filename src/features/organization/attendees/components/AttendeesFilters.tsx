import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { getUniquePrograms } from "../data";

interface AttendeesFiltersProps {
  onSearch: (query: string) => void;
  onSortChange: (field: string, direction: "asc" | "desc") => void;
  onProgramFilter: (programId: string | undefined) => void;
}

export function AttendeesFilters({
  onSearch,
  onSortChange,
  onProgramFilter,
}: AttendeesFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const programs = getUniquePrograms();

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-");
    onSortChange(field, direction as "asc" | "desc");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {/* Sort options */}
        <Select defaultValue="name-asc" onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="program-asc">Program (A-Z)</SelectItem>
            <SelectItem value="program-desc">Program (Z-A)</SelectItem>
            <SelectItem value="timestamp-asc">Time (Earliest)</SelectItem>
            <SelectItem value="timestamp-desc">Time (Latest)</SelectItem>
            <SelectItem value="id-asc">ID (Asc)</SelectItem>
            <SelectItem value="id-desc">ID (Desc)</SelectItem>
          </SelectContent>
        </Select>

        {/* Program filter */}
        <Select
          onValueChange={(value) =>
            onProgramFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="relative w-full sm:w-auto flex-1 sm:max-w-[300px]"
      >
        <Input
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-8 top-0 h-full"
            onClick={clearSearch}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
