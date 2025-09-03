"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventDetails } from "@/features/organization/attendees/components/EventDetails";
import { AttendanceList } from "@/features/organization/attendees/components/AttendanceList";
import { AttendeesHeader } from "@/features/organization/attendees/components/AttendeesHeader";
import { EventSkeleton } from "@/features/organization/attendees/components/EventSkeleton";
import { useEventAttendees } from "@/features/organization/attendees/hooks/useEventAttendees";
import { AttendeesPagination } from "@/features/organization/attendees/components/AttendeesPagination";
import { AttendeesFilters } from "@/features/organization/attendees/components/AttendeesFilters";

export default function EventAttendeesPage() {
  const params = useParams();
  // Fix: Don't force conversion to number as your Event IDs might be strings
  const eventId = params.id as string;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    event,
    attendees,
    totalAttendees,
    loading,
    error,
    refreshAttendees,
    handleSortChange,
    handleProgramFilter,
    handleSearch,
  } = useEventAttendees(eventId, currentPage, pageSize);

  const totalPages = Math.ceil(totalAttendees / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <EventSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Button asChild variant="ghost" className="mb-4 p-0 h-auto">
          <Link href="/org-events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">
            Error loading event details: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-4 p-0 h-auto">
        <Link href="/org-events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      {/* Event details */}
      <EventDetails event={event} attendeeCount={totalAttendees} />

      {/* Attendees header with actions */}
      <AttendeesHeader
        event={event}
        onImport={() => {
          /* Import functionality */
        }}
      />

      {/* Filters and search */}
      <AttendeesFilters
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onProgramFilter={handleProgramFilter}
      />

      {/* Attendees list */}
      <AttendanceList attendees={attendees} onRefresh={refreshAttendees} />

      {/* Pagination */}
      {totalAttendees > 0 && (
        <AttendeesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
