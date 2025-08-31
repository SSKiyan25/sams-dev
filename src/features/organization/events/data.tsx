// Event status type
export type EventStatus = "ongoing" | "upcoming" | "archived" | "completed";

// Event type
export type Event = {
  id: number;
  name: string;
  date: string;
  majorEvent?: boolean;
  timeInStart?: string | null;
  timeInEnd?: string | null;
  timeOutStart?: string | null;
  timeOutEnd?: string | null;
  location: string;
  note: string | "";
  attendees: number;
  status: EventStatus;
};

// Utility functions for data filtering
export const getFilteredEvents = (
  events: Event[],
  status: "all" | EventStatus,
  searchQuery: string
): Event[] => {
  return events.filter((event) => {
    // Filter by status
    if (status !== "all" && event.status !== status) {
      return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !event.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

// Pagination utility
export const paginateEvents = (
  events: Event[],
  currentPage: number,
  itemsPerPage: number
): Event[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return events.slice(startIndex, startIndex + itemsPerPage);
};
