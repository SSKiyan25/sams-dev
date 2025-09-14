/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { Member } from "../../members/types";
import {
  searchUserByName,
  searchUserByStudentId,
  checkLogAttendanceExist,
} from "@/firebase";
import { isValidStudentId } from "../utils";
import { toast } from "sonner";
import { User } from "firebase/auth";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  status:
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "not-found"
    | "invalid-format";
  student: Member | null;
}

export function useStudentSearch(
  eventId: string,
  type: "time-in" | "time-out"
) {
  const [studentId, setStudentId] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasPerformedNameSearch, setHasPerformedNameSearch] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult>({
    status: "idle",
    student: null,
  });
  const [nameSearchResults, setNameSearchResults] = useState<Member[]>([]);

  // Debounce search inputs to reduce unnecessary reads
  const debouncedSearchName = useDebounce(searchName, 300);

  // Cache results to prevent duplicate reads
  const searchCache = new Map<string, Member | Member[] | null>();
  const checkCache = new Map<string, boolean>();

  // Search by ID (manual trigger)
  const searchById = useCallback(
    async (id: string, currentUser: User | null, showToasts = true) => {
      if (!currentUser || !id.trim()) {
        return { status: "idle" as const, student: null };
      }

      if (!isValidStudentId(id)) {
        if (showToasts) {
          const trimmed = id.trim();
          if (trimmed.length < 8) {
            toast.error(`Student ID incomplete. Expected format: XX-X-XXXXX`);
          } else if (trimmed.length > 10) {
            toast.error(`Student ID too long. Expected format: XX-X-XXXXX`);
          } else if (!/^\d{2}-\d{1}-\d{5}$/.test(trimmed)) {
            toast.error(`Invalid student ID format. Expected: XX-X-XXXXX`);
          }
        }
        return { status: "invalid-format" as const, student: null };
      }

      // Check cache first
      const cacheKey = `id:${id}`;
      if (searchCache.has(cacheKey)) {
        const cachedStudent = searchCache.get(cacheKey);
        return {
          status: cachedStudent ? "success" : "not-found",
          student: cachedStudent,
        } as SearchResult;
      }

      try {
        setSearchResult({ status: "loading", student: null });

        // Simulate minimum loading time for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        const student = (await searchUserByStudentId(
          id,
          currentUser
        )) as unknown as Member;

        // Cache the result
        searchCache.set(cacheKey, student || null);

        if (student) {
          if (showToasts) toast.success("Student found");
          return { status: "success" as const, student };
        } else {
          if (showToasts) toast.error("Student not found");
          return { status: "not-found" as const, student: null };
        }
      } catch (error) {
        console.error("Error searching by ID:", error);
        if (showToasts) toast.error("Error searching for student");
        return { status: "error" as const, student: null };
      }
    },
    []
  );

  // Search by name
  const searchByName = useCallback(
    async (name: string, currentUser: User | null, showToasts = true) => {
      if (!currentUser || !name || typeof name !== "string" || !name.trim()) {
        return [] as Member[];
      }

      // Check cache first
      const cacheKey = `name:${name.toLowerCase()}`;
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey) as unknown as Member[];
      }

      setIsSearching(true);

      try {
        // Minimum loading time for better UX
        const [results] = await Promise.all([
          searchUserByName(name, currentUser) as unknown as Member[],
          new Promise((resolve) => setTimeout(resolve, 200)),
        ]);

        // Cache the results
        searchCache.set(cacheKey, results);

        if (showToasts) {
          if (results.length === 0) {
            toast.error(`No students found matching "${name}"`);
          } else {
            toast.success(
              `Found ${results.length} student${
                results.length !== 1 ? "s" : ""
              }`
            );
          }
        }

        return results;
      } catch (error) {
        console.error("Error searching by name:", error);
        if (showToasts) toast.error("Error searching for students");
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Check if attendance record exists
  const checkAttendanceExists = useCallback(
    async (studentId: string): Promise<boolean> => {
      const cacheKey = `check:${eventId}:${studentId}:${type}`;

      if (checkCache.has(cacheKey)) {
        return checkCache.get(cacheKey) as boolean;
      }

      try {
        const exists = await checkLogAttendanceExist(eventId, studentId, type);
        checkCache.set(cacheKey, exists);
        return exists;
      } catch (error) {
        console.error("Error checking attendance:", error);
        return false;
      }
    },
    [eventId, type]
  );

  // Auto-search by name when debounced value changes
  useEffect(() => {
    if (debouncedSearchName && debouncedSearchName.trim().length >= 3) {
      const performSearch = async () => {
        const results = await searchByName(debouncedSearchName, null, false);
        setNameSearchResults(results);
      };

      performSearch();
    }
  }, [debouncedSearchName, searchByName]);

  return {
    // State
    studentId,
    setStudentId,
    searchName,
    setSearchName,
    isSearching,
    setIsSearching,
    searchResult,
    setSearchResult,
    nameSearchResults,
    setNameSearchResults,
    hasPerformedNameSearch,
    setHasPerformedNameSearch,

    // Methods
    searchById,
    searchByName,
    checkAttendanceExists,

    // Reset functions
    resetSearch: () => {
      setStudentId("");
      setSearchName("");
      setSearchResult({ status: "idle", student: null });
      setNameSearchResults([]);
      setHasPerformedNameSearch(false);
    },
  };
}
