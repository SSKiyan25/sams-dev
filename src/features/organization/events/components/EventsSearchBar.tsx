import { SearchIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventsSearchBarProps {
  searchQuery: string;
  resultsCount: number;
  onClear: () => void;
}

export function EventsSearchBar({
  searchQuery,
  resultsCount,
  onClear,
}: EventsSearchBarProps) {
  return (
    <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
      <div className="flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Search results for:{" "}
          <span className="font-bold">&quot;{searchQuery}&quot;</span>
        </span>
        <Badge variant="outline" className="ml-2">
          {resultsCount} results
        </Badge>
      </div>
      <button
        onClick={onClear}
        className="text-muted-foreground hover:text-foreground"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
