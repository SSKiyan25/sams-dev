import { useState } from "react";
import { EventCard } from "./EventCard";
import { EditEventDialog } from "./EditEventDialog";
import { Event } from "../types";
import { archiveEvent, deleteEvent } from "@/firebase";

interface EventsListProps {
  events: Event[];
  onEventsUpdate: () => void;
}

export function EventsList({ events, onEventsUpdate }: EventsListProps) {
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleArchiveClick = async (event: Event) => {
    if (window.confirm(`Are you sure you want to archive "${event.name}"?`)) {
      await archiveEvent(event.id.toString());
      onEventsUpdate();
    }
  };

  const handleDeleteClick = async (event: Event) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${event.name}"? This action cannot be undone.`
      )
    ) {
      await deleteEvent(event.id.toString());
      onEventsUpdate();
    }
  };

  const handleEventEdited = () => {
    onEventsUpdate();
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };


  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No events found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={handleEditClick}
            onArchive={handleArchiveClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
      {selectedEvent && (
        <EditEventDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          selectedEvent={selectedEvent}
          onEventEdited={handleEventEdited}
        />
      )}
    </>
  );
}
