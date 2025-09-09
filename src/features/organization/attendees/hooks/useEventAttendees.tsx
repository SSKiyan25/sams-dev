/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { EventAttendance } from "../../log-attendance/types";
import { getAttendanceRecord, getEventById } from "@/firebase";
import { Event } from "../../events/types";
import { SearchParams } from "../types";

const PAGE_SIZE = 10;

type SortOption = {
  field: string;
  direction: "asc" | "desc";
};

export const useEventAttendees = (eventId: string) => {
  const [eventData, setEventData] = useState<Event>();
  const [attendees, setAttendees] = useState<EventAttendance[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendeesLoading, setAttendeesLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState<SearchParams | null>(null);
  const [cursors, setCursors] = useState<(DocumentSnapshot | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "firstName",
    direction: "asc",
  });
  const [programFilter, setProgramFilter] = useState<string | null>(null);

  useEffect(() => {
    const performFetch = async () => {
      if (!eventId) return;
      setAttendeesLoading(true);

      const cursorForCurrentPage = cursors[currentPage - 1];

      try {
        const {
          records: fetchedAttendees,
          total,
          nextCursor,
        } = await getAttendanceRecord(
          eventId,
          PAGE_SIZE,
          sortOption,
          cursorForCurrentPage || undefined,
          programFilter ?? undefined,
          searchQuery
        );

        setAttendees(fetchedAttendees);
        setTotalAttendees(total);

        // This state update is now safe because `cursors` is not a dependency of this useEffect
        if (nextCursor && cursors.length === currentPage) {
          setCursors((prev) => [...prev, nextCursor]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setAttendeesLoading(false);
      }
    };

    performFetch();

    // The dependencies are the values that should trigger a new fetch.
    // `cursors` is intentionally omitted to prevent the loop.
  }, [eventId, currentPage, searchQuery, sortOption, programFilter]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const event = (await getEventById(eventId)) as Event;
        setEventData(event);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  const resetPagination = () => {
    setCurrentPage(1);
    setCursors([null]);
  };

  const handleSearch = (query: SearchParams) => {
    setSearchQuery(query);
    resetPagination();
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as [string, "asc" | "desc"];
    setSortOption({ field, direction });
    resetPagination();
  };

  const handleProgramFilter = (program: string | undefined) => {
    setProgramFilter(program || null);
    resetPagination();
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && currentPage < cursors.length) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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
    goToNextPage: () => handlePageChange("next"),
    goToPrevPage: () => handlePageChange("prev"),
    goToSpecificPage: (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    hasNextPage: currentPage < cursors.length,
    hasPrevPage: currentPage > 1,
    handleSearch,
    handleSortChange,
    handleProgramFilter,
    // Note: refreshAttendees is removed as it's no longer needed in this pattern
  };
};
