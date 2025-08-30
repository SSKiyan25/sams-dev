import { useEffect, useState } from "react";
import { EventCard } from "./EventCard";
import { Event } from "../data";

interface EventsListProps {
  events: Event[];
}
export function EventsList({ events }: EventsListProps) {
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
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
