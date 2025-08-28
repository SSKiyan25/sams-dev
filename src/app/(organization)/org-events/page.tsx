"use client";

import { useState, useEffect } from "react";
import { EventsList } from "@/features/organization/events/components/EventsList";
import { EventsHeader } from "@/features/organization/events/components/EventsHeader";
import { EventsFilters } from "@/features/organization/events/components/EventsFilters";
import { EventsPagination } from "@/features/organization/events/components/EventsPagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventsData } from "@/features/organization/events/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function EventsPage() {
  // Default to "ongoing" tab, but will adjust based on available data
  const [currentTab, setCurrentTab] = useState<
    "ongoing" | "upcoming" | "completed" | "archived" | "all"
  >("ongoing");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Check if screen is mobile
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Determine initial tab based on data availability
  useEffect(() => {
    // Check if there are any ongoing events
    const hasOngoingEvents = eventsData.some(
      (event) => event.status === "ongoing"
    );

    if (hasOngoingEvents) {
      setCurrentTab("ongoing");
    } else {
      // If no ongoing events, check for upcoming events
      const hasUpcomingEvents = eventsData.some(
        (event) => event.status === "upcoming"
      );

      if (hasUpcomingEvents) {
        setCurrentTab("upcoming");
      } else {
        // If no upcoming events either, default to "completed"
        setCurrentTab("completed");
      }
    }
  }, []);

  // Reset pagination when changing tabs or search
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, searchQuery]);

  // Create hook for useMediaQuery
  const TabsOrSelect = () => {
    if (isDesktop) {
      return (
        <TabsList className="grid w-full gap-2 grid-cols-5">
          <TabsTrigger value="ongoing" className="relative">
            Ongoing
            {/* Show indicator dot for ongoing events */}
            {eventsData.some((e) => e.status === "ongoing") && (
              <span className="absolute h-2 w-2 rounded-full bg-primary -top-0.5 -right-0.5"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      );
    }

    return (
      <div className="w-full mb-4">
        <Select
          value={currentTab}
          onValueChange={(
            value: "ongoing" | "upcoming" | "completed" | "archived" | "all"
          ) => setCurrentTab(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ongoing" className="relative">
              <div className="flex items-center">
                Ongoing
                {eventsData.some((e) => e.status === "ongoing") && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
                )}
              </div>
            </SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All Events</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <EventsHeader onSearch={setSearchQuery} />

      <Tabs
        value={currentTab}
        className="w-full"
        onValueChange={(value) => setCurrentTab(value as any)}
      >
        <TabsOrSelect />

        <div className="mt-4">
          <EventsFilters />
        </div>

        <TabsContent value="ongoing" className="mt-4">
          <EventsList
            status="ongoing"
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <EventsList
            status="upcoming"
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <EventsList
            status="completed"
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <EventsList
            status="archived"
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <EventsList
            status="all"
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>
      </Tabs>

      <EventsPagination
        currentPage={currentPage}
        totalPages={5} // This would be calculated based on total events
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
