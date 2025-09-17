"use client";

import { useState, useEffect, useCallback } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { EventAttendance } from "../../log-attendance/types";
import { getAttendanceRecord, getEventById } from "@/firebase";
import { Event } from "../../events/types";
import { SearchParams } from "../types";
import { cacheService, CACHE_DURATIONS } from "@/services/cacheService";

const PAGE_SIZE = 10;

type SortOption = {
  field: string;
  direction: "asc" | "desc";
};

// Store cursors in memory between page navigations
const cursorStorage = new Map<string, (DocumentSnapshot | null)[]>();

export const useEventAttendees = (eventId: string) => {
  const [eventData, setEventData] = useState<Event>();
  const [attendees, setAttendees] = useState<EventAttendance[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendeesLoading, setAttendeesLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchParams | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "firstName",
    direction: "asc",
  });
  const [programFilter, setProgramFilter] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"cache" | "server">("server");

  // Initialize cursors from storage or create new array
  const getCursors = useCallback(() => {
    const key = `event-${eventId}`;
    if (!cursorStorage.has(key)) {
      cursorStorage.set(key, [null]);
    }
    return cursorStorage.get(key)!;
  }, [eventId]);

  const setCursors = useCallback(
    (value: (DocumentSnapshot | null)[]) => {
      const key = `event-${eventId}`;
      cursorStorage.set(key, value);
    },
    [eventId]
  );

  // Create a unique cache key for the current query parameters
  const createCacheKey = useCallback(() => {
    return `event-attendees:${eventId}:page${currentPage}:sort${
      sortOption.field
    }-${sortOption.direction}:program${programFilter || "all"}:search${
      searchQuery?.query || "none"
    }`;
  }, [eventId, currentPage, sortOption, programFilter, searchQuery]);

  // Fetch event attendees with caching
  const fetchAttendees = useCallback(
    async (forceRefresh = false) => {
      if (!eventId) return;
      setAttendeesLoading(true);

      const cacheKey = createCacheKey();
      const cursors = getCursors();
      const cursorForCurrentPage = cursors[currentPage - 1];

      try {
        let result;

        if (forceRefresh) {
          // Skip cache on force refresh
          result = await getAttendanceRecord(
            eventId,
            PAGE_SIZE,
            sortOption,
            cursorForCurrentPage || undefined,
            programFilter ?? undefined,
            searchQuery
          );

          // Update cache with fresh data
          cacheService.set(cacheKey, result, CACHE_DURATIONS.ATTENDANCE);
          setDataSource("server");
        } else {
          // Try to get from cache first
          result = await cacheService.getOrFetch(
            cacheKey,
            async () => {
              setDataSource("server");
              return getAttendanceRecord(
                eventId,
                PAGE_SIZE,
                sortOption,
                cursorForCurrentPage || undefined,
                programFilter ?? undefined,
                searchQuery
              );
            },
            CACHE_DURATIONS.ATTENDANCE
          );
          setDataSource("cache");
        }

        setAttendees(result.records);
        setTotalAttendees(result.total);

        // Save the next cursor if we have one and need it
        if (result.nextCursor && cursors.length === currentPage) {
          const newCursors = [...cursors, result.nextCursor];
          setCursors(newCursors);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setAttendeesLoading(false);
      }
    },
    [
      eventId,
      currentPage,
      searchQuery,
      sortOption,
      programFilter,
      createCacheKey,
      getCursors,
      setCursors,
    ]
  );

  // Fetch event details with caching
  const fetchEventDetails = useCallback(
    async (forceRefresh = false) => {
      if (!eventId) return;
      setLoading(true);

      const cacheKey = `event:${eventId}`;

      try {
        let event;

        if (forceRefresh) {
          // Skip cache on force refresh
          event = (await getEventById(eventId)) as Event;
          cacheService.set(cacheKey, event, CACHE_DURATIONS.EVENTS);
        } else {
          // Try to get from cache first
          event = await cacheService.getOrFetch<Event>(
            cacheKey,
            async () => (await getEventById(eventId)) as Event,
            CACHE_DURATIONS.EVENTS
          );
        }

        setEventData(event);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [eventId]
  );

  // Load data when dependencies change
  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  // Reset pagination when filters change
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setCursors([null]);
  }, [setCursors]);

  // Handlers for user interactions
  const handleSearch = useCallback(
    (query: SearchParams) => {
      setSearchQuery(query);
      resetPagination();
    },
    [resetPagination]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const [field, direction] = value.split("-") as [string, "asc" | "desc"];
      setSortOption({ field, direction });
      resetPagination();
    },
    [resetPagination]
  );

  const handleProgramFilter = useCallback(
    (program: string | undefined) => {
      setProgramFilter(program || null);
      resetPagination();
    },
    [resetPagination]
  );

  const handlePageChange = useCallback(
    (direction: "next" | "prev") => {
      const cursors = getCursors();
      if (direction === "next" && currentPage < cursors.length) {
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev" && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
    [currentPage, getCursors]
  );

  // Manual refresh function that bypasses cache
  const refreshData = useCallback(() => {
    // Invalidate caches for this event
    cacheService.invalidateByPrefix(`event-attendees:${eventId}`);
    cacheService.invalidate(`event:${eventId}`);

    // Force refresh with new data
    fetchEventDetails(true);
    fetchAttendees(true);
  }, [eventId, fetchEventDetails, fetchAttendees]);

  const totalPages = Math.ceil(totalAttendees / PAGE_SIZE);

  return {
    eventData,
    attendees,
    totalAttendees,
    totalPages,
    currentPage,
    loading,
    attendeesLoading,
    error,
    dataSource,
    goToNextPage: () => handlePageChange("next"),
    goToPrevPage: () => handlePageChange("prev"),
    goToSpecificPage: (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    hasNextPage: currentPage < getCursors().length,
    hasPrevPage: currentPage > 1,
    handleSearch,
    handleSortChange,
    handleProgramFilter,
    refreshData,
  };
};
