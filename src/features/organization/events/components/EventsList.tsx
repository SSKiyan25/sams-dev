import { useEffect, useState } from "react";
import {
  eventsData,
  getFilteredEvents,
  paginateEvents,
  Event,
  EventStatus,
} from "../data";
import { EventCard } from "./EventCard";

interface EventsListProps {
  status: "all" | EventStatus;
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
}

export function EventsList({
  status,
  searchQuery,
  currentPage,
  itemsPerPage,
}: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Filter events based on status and search query
    const filteredEvents = getFilteredEvents(eventsData, status, searchQuery);

    // Paginate the filtered events
    const paginatedEvents = paginateEvents(
      filteredEvents,
      currentPage,
      itemsPerPage
    );

    setEvents(paginatedEvents);
  }, [status, searchQuery, currentPage, itemsPerPage]);

  if (events.length === 0) {
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
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
