// Event status type
export type EventStatus = "ongoing" | "upcoming" | "archived" | "completed";

// Time range type
export type TimeRange = {
  start: string;
  end: string;
} | null;

// Event type
export type Event = {
  id: number;
  name: string;
  date: string;
  timeIn: TimeRange;
  timeOut: TimeRange;
  location: string;
  note: string | null;
  attendees: number;
  status: EventStatus;
};

// Sample events data
export const eventsData: Event[] = [
  {
    id: 1,
    name: "Day 1 Morning Intramurals",
    date: "2025-07-15",
    timeIn: {
      start: "07:30",
      end: "08:30",
    },
    timeOut: {
      start: "11:30",
      end: "12:30",
    },
    location: "University Gymnasium",
    note: "Bring student ID for attendance verification",
    attendees: 242,
    status: "archived",
  },
  {
    id: 2,
    name: "Day 1 Afternoon Competitions",
    date: "2025-07-15",
    timeIn: {
      start: "13:00",
      end: "14:00",
    },
    timeOut: {
      start: "17:00",
      end: "18:00",
    },
    location: "University Gymnasium",
    note: null,
    attendees: 235,
    status: "archived",
  },
  {
    id: 3,
    name: "Day 2 Cultural Show",
    date: "2025-07-16",
    timeIn: {
      start: "09:00",
      end: "10:00",
    },
    timeOut: {
      start: "15:00",
      end: "16:00",
    },
    location: "University Auditorium",
    note: "Cultural attire required for performers",
    attendees: 250,
    status: "archived",
  },
  {
    id: 4,
    name: "Day 3 Academic Quiz Bee",
    date: "2025-07-17",
    timeIn: {
      start: "09:00",
      end: "10:00",
    },
    timeOut: null,
    location: "Science Building",
    note: "Participants should arrive 30 minutes early",
    attendees: 228,
    status: "ongoing",
  },
  {
    id: 5,
    name: "Day 4 Sports Finals",
    date: "2025-07-18",
    timeIn: {
      start: "08:00",
      end: "09:00",
    },
    timeOut: {
      start: "16:00",
      end: "17:00",
    },
    location: "University Stadium",
    note: "Bring water and proper sports attire",
    attendees: 0,
    status: "upcoming",
  },
  {
    id: 6,
    name: "Closing Ceremony",
    date: "2025-07-19",
    timeIn: {
      start: "13:00",
      end: "13:30",
    },
    timeOut: {
      start: "15:30",
      end: "16:00",
    },
    location: "University Auditorium",
    note: "Formal attire required",
    attendees: 0,
    status: "upcoming",
  },
  {
    id: 7,
    name: "Department Meeting",
    date: "2025-07-20",
    timeIn: {
      start: "10:00",
      end: "10:30",
    },
    timeOut: {
      start: "11:30",
      end: "12:00",
    },
    location: "Department Conference Room",
    note: "Attendance mandatory for all faculty members",
    attendees: 0,
    status: "upcoming",
  },
  {
    id: 8,
    name: "Alumni Networking Event",
    date: "2025-07-22",
    timeIn: {
      start: "18:00",
      end: "19:00",
    },
    timeOut: {
      start: "21:00",
      end: "22:00",
    },
    location: "University Ballroom",
    note: "Business casual attire",
    attendees: 0,
    status: "upcoming",
  },
  {
    id: 9,
    name: "Student Government Elections",
    date: "2025-07-25",
    timeIn: {
      start: "08:00",
      end: "17:00",
    },
    timeOut: null,
    location: "Student Center",
    note: "Bring valid student ID to vote",
    attendees: 0,
    status: "upcoming",
  },
  {
    id: 10,
    name: "Faculty Development Workshop",
    date: "2025-07-28",
    timeIn: {
      start: "09:00",
      end: "10:00",
    },
    timeOut: {
      start: "16:00",
      end: "17:00",
    },
    location: "Faculty Center",
    note: "Bring laptops and materials",
    attendees: 0,
    status: "upcoming",
  },
];

// Utility functions for data filtering
export const getFilteredEvents = (
  events: Event[],
  status: "all" | EventStatus,
  searchQuery: string
): Event[] => {
  return events.filter((event) => {
    // Filter by status
    if (status !== "all" && event.status !== status) {
      return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !event.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

// Pagination utility
export const paginateEvents = (
  events: Event[],
  currentPage: number,
  itemsPerPage: number
): Event[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return events.slice(startIndex, startIndex + itemsPerPage);
};
