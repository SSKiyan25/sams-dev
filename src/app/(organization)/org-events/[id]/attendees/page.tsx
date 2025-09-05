"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventDetails } from "@/features/organization/attendees/components/EventDetails";
import { AttendanceList } from "@/features/organization/attendees/components/AttendanceList";
import { AttendeesHeader } from "@/features/organization/attendees/components/AttendeesHeader";
import { EventSkeleton } from "@/features/organization/attendees/components/EventSkeleton";
import { AttendeesPagination } from "@/features/organization/attendees/components/AttendeesPagination";
import { AttendeesFilters } from "@/features/organization/attendees/components/AttendeesFilters";
import { AttendanceListSkeleton } from "@/features/organization/attendees/components/AttendanceListSkeleton";
import { useEventAttendees } from "@/features/organization/attendees/hooks/useEventAttendees";
import { use, useEffect, useState } from "react";
import { getEventById } from "@/firebase";
import { Event } from "@/features/organization/events/types";

export default function EventAttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;
  // All logic is now handled by the custom hook
  const {
    eventData, // FIXED: Use this instead of fetching again
    attendees,
    totalAttendees,
    totalPages,
    currentPage,
    attendeesLoading,
    error,
    handleSearch,
    handleSortChange,
    handleProgramFilter,
    goToNextPage,
    goToPrevPage,
    goToSpecificPage,
    hasNextPage,
    hasPrevPage,
  } = useEventAttendees(eventId);

  // REMOVED: The local useState and useEffect for fetching the event
  // have been removed to avoid fetching the same data twice.

  // Example of how you would use the pagination functions
  const handleNextPage = () => {
    if (hasNextPage) {
      goToNextPage();
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      goToPrevPage();
    }
  };

  if (attendeesLoading && !eventData) {
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
      <Button asChild variant="ghost" className="mb-4 p-0 h-auto">
        <Link href="/org-events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      <EventDetails
        event={eventData as unknown as Event}
        attendeeCount={totalAttendees}
      />

      <AttendeesHeader
        event={eventData as unknown as Event}
        onExport={() => {
          /* Export logic */
        }}
      />

      <AttendeesFilters
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onProgramFilter={handleProgramFilter}
      />

      {attendeesLoading ? (
        <AttendanceListSkeleton />
      ) : (
        <AttendanceList attendees={attendees} />
      )}

      {totalAttendees > 0 && !attendeesLoading && (
        <AttendeesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          handleNextPage={handleNextPage}
          handlePrevPage={handlePrevPage}
          onPageChange={goToSpecificPage}
        />
      )}
    </div>
  );
}