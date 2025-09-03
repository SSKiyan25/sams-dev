import { useState, useEffect, useCallback } from "react";
import { Event } from "../../events/types";
import { AttendanceRecord } from "../../log-attendance/types";
import { getEventById, getAttendanceRecords } from "../data";

export function useEventAttendees(
  eventId: string | number,
  page: number = 1,
  pageSize: number = 10
) {
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter and sort states
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterProgram, setFilterProgram] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Convert eventId to number if it's a string and your API expects a number
      const numericEventId =
        typeof eventId === "string" ? parseInt(eventId) : eventId;

      // Check if conversion resulted in a valid number
      if (isNaN(numericEventId)) {
        throw new Error("Invalid event ID");
      }

      const [eventData, attendanceData] = await Promise.all([
        getEventById(numericEventId),
        getAttendanceRecords(
          numericEventId,
          page,
          pageSize,
          sortField,
          sortDirection,
          filterProgram,
          searchQuery
        ),
      ]);

      if (!eventData) {
        throw new Error("Event not found");
      }

      setEvent(eventData);
      setAttendees(attendanceData.records);
      setTotalAttendees(attendanceData.total);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Error fetching event attendees:", err);
    } finally {
      setLoading(false);
    }
  }, [
    eventId,
    page,
    pageSize,
    sortField,
    sortDirection,
    filterProgram,
    searchQuery,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshAttendees = () => {
    fetchData();
  };

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleProgramFilter = (programId: string | undefined) => {
    setFilterProgram(programId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return {
    event,
    attendees,
    totalAttendees,
    loading,
    error,
    refreshAttendees,
    handleSortChange,
    handleProgramFilter,
    handleSearch,
  };
}
