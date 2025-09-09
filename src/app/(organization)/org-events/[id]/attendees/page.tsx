"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { AttendanceList } from "@/features/organization/attendees/components/AttendanceList";
import { AttendeesHeader } from "@/features/organization/attendees/components/AttendeesHeader";
import { EventDetails } from "@/features/organization/attendees/components/EventDetails";
import { EventSkeleton } from "@/features/organization/attendees/components/EventSkeleton";
import { AttendeesPagination } from "@/features/organization/attendees/components/AttendeesPagination";
import { AttendeesFilters } from "@/features/organization/attendees/components/AttendeesFilters";
import { AttendanceListSkeleton } from "@/features/organization/attendees/components/AttendanceListSkeleton";
import { useEventAttendees } from "@/features/organization/attendees/hooks/useEventAttendees";
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4">
          <EventSkeleton />
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/org-events" className="font-nunito-sans">
                      Events
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-nunito-sans">Unknown Event</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/org-events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/org-events" className="font-nunito-sans">
                    Events
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-nunito-sans">
                  {eventData?.name || "Event Attendees"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Event Details Header */}
        <EventDetails 
          event={eventData as unknown as Event} 
          attendeeCount={totalAttendees}
        />

        {/* Attendees Header */}
        <div className="mb-6">
          <AttendeesHeader
            event={eventData as unknown as Event}
            onExport={() => {
              /* Export logic */
            }}
          />
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <AttendeesFilters
            onSearch={handleSearch}
            onSortChange={handleSortChange}
            onProgramFilter={handleProgramFilter}
          />
        </div>

        {/* Attendees List */}
        <div className="mb-6">
          {attendeesLoading ? (
            <AttendanceListSkeleton />
          ) : (
            <AttendanceList attendees={attendees} />
          )}
        </div>

        {/* Pagination */}
        {totalAttendees > 0 && !attendeesLoading && (
          <div className="flex justify-center">
            <AttendeesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              handleNextPage={handleNextPage}
              handlePrevPage={handlePrevPage}
              onPageChange={goToSpecificPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}