"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentStats, eventAttendance } from "../data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

// Custom tooltip component for the chart
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const event = eventAttendance.find((e) => e.eventName === label);

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium text-sm mb-1">{label}</p>
        <div className="text-xs space-y-1">
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          {event && (
            <p className="text-muted-foreground pt-1">
              {new Date(event.date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export function MembersStats() {
  // Filter options
  const [filterType, setFilterType] = useState<string>("recent");

  // Get years from event data for filter options
  const years = useMemo(() => {
    const uniqueYears = new Set<string>();
    eventAttendance.forEach((event) => {
      const year = new Date(event.date).getFullYear().toString();
      uniqueYears.add(year);
    });
    return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, []);

  // Filter and prepare chart data based on selected filter
  const chartData = useMemo(() => {
    let filteredEvents = [...eventAttendance];

    // Apply filters
    if (filterType === "recent") {
      // Show the most recent 10 events
      filteredEvents = filteredEvents
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    } else if (years.includes(filterType)) {
      // Filter by selected year
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date).getFullYear().toString() === filterType
      );
    }

    // Prepare chart data from filtered events
    return filteredEvents
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
      .map((event, index) => ({
        name: event.eventName,
        displayName: `Event ${index + 1}`,
        Present: event.present,
        Absent: event.absent,
        date: event.date,
      }));
  }, [filterType, years]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats.totalStudents}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Absences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats.totalAbsences}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats.attendanceRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance by Event</CardTitle>
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent Events</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Present" fill="var(--primary)" name="Present" />
                <Bar dataKey="Absent" fill="var(--destructive)" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Event index reference - only shown if there are multiple events */}
          {chartData.length > 1 && (
            <div className="mt-4 border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Event Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {chartData.map((event, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-medium">{event.displayName}:</span>
                    <span className="truncate">{event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
