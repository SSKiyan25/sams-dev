import { useState, useEffect, useCallback } from "react";
import { Event } from "../types";
import { getPaginatedEvents, getEvents } from "@/firebase";
import { EventStatus } from "../components/EventsTabNavigation";

interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export function useEventsData(currentTab: EventStatus) {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: "date",
    direction: "desc",
  });

  // Convert sort option string to field and direction
  const convertSortOption = (sortOption: string): SortOptions => {
    switch (sortOption) {
      case "date-asc":
        return { field: "date", direction: "asc" };
      case "date-desc":
        return { field: "date", direction: "desc" };
      case "name-asc":
        return { field: "name", direction: "asc" };
      case "name-desc":
        return { field: "name", direction: "desc" };
      case "attendees-asc":
        return { field: "attendees", direction: "asc" };
      case "attendees-desc":
        return { field: "attendees", direction: "desc" };
      default:
        return { field: "date", direction: "desc" };
    }
  };

  // Fetch events - separate logic for search vs. normal tab view
  const fetchEvents = useCallback(async () => {
    setLoading(true);

    try {
      if (searchQuery) {
        // For search, get all events and filter client-side (simpler approach)
        const allEvents = await getEvents();
        let filteredEvents = allEvents.filter(
          (event) =>
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Apply date filter if set
        if (filterDate) {
          const dateString = filterDate.toISOString().split("T")[0];
          filteredEvents = filteredEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate.toISOString().split("T")[0] === dateString;
          });
        }

        // Sort events client-side
        filteredEvents.sort((a, b) => {
          if (sortOptions.field === "date") {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOptions.direction === "asc"
              ? dateA - dateB
              : dateB - dateA;
          } else if (sortOptions.field === "name") {
            return sortOptions.direction === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else if (sortOptions.field === "attendees") {
            return sortOptions.direction === "asc"
              ? a.attendees - b.attendees
              : b.attendees - a.attendees;
          }
          return 0;
        });

        setEvents(filteredEvents);
        setTotalEvents(filteredEvents.length);
      } else {
        // For normal tab view, use server-side pagination
        const skip = (currentPage - 1) * itemsPerPage;

        const result = await getPaginatedEvents(
          currentTab,
          sortOptions.field,
          sortOptions.direction,
          itemsPerPage,
          null,
          undefined,
          skip,
          filterDate // Pass the filter date to backend
        );

        setEvents(result.events);
        setTotalEvents(result.totalCount);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentTab,
    searchQuery,
    sortOptions,
    itemsPerPage,
    currentPage,
    filterDate,
  ]);

  // Handle page change - only for tab view, not search
  const handlePageChange = useCallback(
    async (page: number) => {
      if (searchQuery) {
        // No pagination for search results
        return;
      }

      setCurrentPage(page);
    },
    [searchQuery]
  );

  // Handle date filter change
  const handleDateChange = useCallback((date: Date | undefined) => {
    setFilterDate(date);
    setCurrentPage(1);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle sorting
  const handleSort = useCallback((sortOption: string) => {
    setSortOptions(convertSortOption(sortOption));
    setCurrentPage(1);
  }, []);

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [
    fetchEvents,
    currentPage,
    currentTab,
    sortOptions,
    searchQuery,
    filterDate,
  ]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab]);

  return {
    events,
    totalEvents,
    loading,
    currentPage,
    totalPages: Math.ceil(totalEvents / itemsPerPage),
    handlePageChange,
    handleSearch,
    handleSort,
    handleDateChange,
    searchQuery,
  };
}
