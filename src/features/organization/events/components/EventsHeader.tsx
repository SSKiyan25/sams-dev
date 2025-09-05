import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import { AddEventDialog } from "./AddEventDialog";

interface EventsHeaderProps {
  onSearch: (query: string) => void;
  onEventAdded?: () => void;
}

export function EventsHeader({ onSearch, onEventAdded }: EventsHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleEventAdded = () => {
    setIsAddDialogOpen(false);
    onEventAdded?.();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s events and track attendance
        </p>
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="w-full pl-8 sm:w-[200px] md:w-[250px]"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </form>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="hover:cursor-pointer hover:bg-primary/90"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <AddEventDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onEventAdded={handleEventAdded}
      />
    </div>
  );
}
