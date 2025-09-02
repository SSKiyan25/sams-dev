"use client";

import { useState } from "react";
import { EventsList } from "@/features/organization/events/components/EventsList";
import { EventsHeader } from "@/features/organization/events/components/EventsHeader";
import { EventsFilters } from "@/features/organization/events/components/EventsFilters";
import { EventsPagination } from "@/features/organization/events/components/EventsPagination";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EventsSkeletonLoader } from "@/features/organization/events/components/EventsSkeletonLoader";
import { EventsSearchBar } from "@/features/organization/events/components/EventsSearchBar";
import {
  EventsTabNavigation,
  EventStatus,
} from "@/features/organization/events/components/EventsTabNavigation";
import { useEventsData } from "@/features/organization/events/hooks/useEventsData";

export default function EventsPage() {
  const [currentTab, setCurrentTab] = useState<EventStatus>("ongoing");
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Use the updated hook with server-side pagination
  const {
    events,
    totalEvents,
    loading,
    currentPage,
    totalPages,
    handlePageChange,
    handleSearch,
    handleSort,
    handleDateChange,
    searchQuery,
  } = useEventsData(currentTab);

  // Check if screen is mobile
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Handle search activation/deactivation
  const onSearch = (query: string) => {
    handleSearch(query);
    setIsSearchActive(!!query.trim());
  };

  // Clear search
  const clearSearch = () => {
    handleSearch("");
    setIsSearchActive(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <EventsHeader
        onSearch={onSearch}
        onEventAdded={() => {
          // Refresh the events list after adding a new event
          handlePageChange(1);
        }}
      />

      {/* Search results indicator */}
      {isSearchActive && (
        <EventsSearchBar
          searchQuery={searchQuery}
          resultsCount={totalEvents}
          onClear={clearSearch}
        />
      )}

      <div className="mt-4">
        <EventsFilters
          onSetDate={handleDateChange}
          onSortBy={handleSort}
          disabled={loading}
        />
      </div>

      {isSearchActive ? (
        // Search results view - no tabs, no pagination
        <div className="mt-4">
          {loading ? (
            <EventsSkeletonLoader />
          ) : (
            <EventsList
              events={events}
              onEventsUpdate={() => handleSearch(searchQuery)}
            />
          )}
        </div>
      ) : (
        // Normal tabbed view with pagination
        <Tabs
          value={currentTab}
          className="w-full mt-4"
          onValueChange={(value) => setCurrentTab(value as EventStatus)}
        >
          <EventsTabNavigation
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            loading={loading}
            isDesktop={isDesktop}
          />

          <TabsContent value={currentTab} className="mt-4">
            {loading ? (
              <EventsSkeletonLoader />
            ) : (
              <EventsList
                events={events}
                onEventsUpdate={() => handlePageChange(currentPage)}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Only show pagination for non-search results */}
      {!loading && totalEvents > 0 && !isSearchActive && (
        <EventsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
