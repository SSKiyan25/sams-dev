import { Event } from "../events/types";
import { AttendanceRecord } from "../log-attendance/types";
import { Member } from "../members/types";

// Programs mapping
const programsMap: Record<string, string> = {
  CS101: "BSCS",
  CS102: "BSIT",
  CS103: "BSIS",
  CS104: "BSCE",
  CS105: "BSCA",
};

// Mock event data
export const mockEvent: Event = {
  id: 123,
  name: "Programming Workshop",
  date: "2025-09-15",
  majorEvent: true,
  location: "Computer Lab",
  note: "Bring your laptops",
  attendees: 25,
  status: "ongoing",
  timeInStart: "08:00",
  timeInEnd: "08:30",
  timeOutStart: "16:00",
  timeOutEnd: "16:30",
};

// Mock members data with year levels
export const mockMembers: Member[] = [
  {
    firstName: "John",
    lastName: "Doe",
    programId: "CS101",
    facultyId: "F001",
    studentId: "2023001",
    email: "john.doe@example.com",
    role: "user",
    yearLevel: 1,
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    programId: "CS101",
    facultyId: "F001",
    studentId: "2023002",
    email: "jane.smith@example.com",
    role: "user",
    yearLevel: 1,
  },
  {
    firstName: "Michael",
    lastName: "Johnson",
    programId: "CS102",
    facultyId: "F002",
    studentId: "2023003",
    email: "michael.johnson@example.com",
    role: "user",
    yearLevel: 2,
  },
  {
    firstName: "Emily",
    lastName: "Williams",
    programId: "CS102",
    facultyId: "F002",
    studentId: "2023004",
    email: "emily.williams@example.com",
    role: "user",
    yearLevel: 2,
  },
  {
    firstName: "David",
    lastName: "Brown",
    programId: "CS103",
    facultyId: "F003",
    studentId: "2023005",
    email: "david.brown@example.com",
    role: "admin",
    yearLevel: 3,
  },
  {
    firstName: "Sarah",
    lastName: "Jones",
    programId: "CS103",
    facultyId: "F003",
    studentId: "2023006",
    email: "sarah.jones@example.com",
    role: "user",
    yearLevel: 3,
  },
  {
    firstName: "Robert",
    lastName: "Garcia",
    programId: "CS104",
    facultyId: "F004",
    studentId: "2023007",
    email: "robert.garcia@example.com",
    role: "user",
    yearLevel: 4,
  },
  {
    firstName: "Lisa",
    lastName: "Miller",
    programId: "CS104",
    facultyId: "F004",
    studentId: "2023008",
    email: "lisa.miller@example.com",
    role: "user",
    yearLevel: 4,
  },
  {
    firstName: "James",
    lastName: "Davis",
    programId: "CS105",
    facultyId: "F005",
    studentId: "2023009",
    email: "james.davis@example.com",
    role: "user",
    yearLevel: 1,
  },
  {
    firstName: "Jennifer",
    lastName: "Rodriguez",
    programId: "CS105",
    facultyId: "F005",
    studentId: "2023010",
    email: "jennifer.rodriguez@example.com",
    role: "user",
    yearLevel: 2,
  },
  {
    firstName: "William",
    lastName: "Martinez",
    programId: "CS101",
    facultyId: "F001",
    studentId: "2023011",
    email: "william.martinez@example.com",
    role: "user",
    yearLevel: 3,
  },
  {
    firstName: "Patricia",
    lastName: "Hernandez",
    programId: "CS101",
    facultyId: "F001",
    studentId: "2023012",
    email: "patricia.hernandez@example.com",
    role: "user",
    yearLevel: 4,
  },
];

// Helper to get program name from program ID
export const getProgramName = (programId: string): string => {
  return programsMap[programId] || "Unknown";
};

// Generate random times for today
const generateRandomTime = () => {
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Generate today's date in ISO format
const today = new Date().toISOString().split("T")[0];

// Create mock attendance records
export const mockAttendanceRecords: AttendanceRecord[] = mockMembers.flatMap(
  (member, index) => {
    // Only create time-in records for some members
    const hasTimeIn = Math.random() > 0.2;
    // Only some of those with time-in will have time-out
    const hasTimeOut = hasTimeIn && Math.random() > 0.3;

    const records: AttendanceRecord[] = [];

    if (hasTimeIn) {
      records.push({
        id: `in-${index}`,
        eventId: 123,
        student: member,
        timestamp: `${today}T${generateRandomTime()}:00Z`,
        type: "time-in",
      });
    }

    if (hasTimeOut) {
      records.push({
        id: `out-${index}`,
        eventId: 123,
        student: member,
        timestamp: `${today}T${generateRandomTime()}:00Z`,
        type: "time-out",
      });
    }

    return records;
  }
);

// Function to get event by ID
export const getEventById = async (
  id: string | number
): Promise<Event | null> => {
  // Convert to string for comparison
  const eventId = String(id);
  const mockEventId = String(mockEvent.id);

  return eventId === mockEventId ? mockEvent : null;
};

// Function to get attendance records with pagination and filtering
export const getAttendanceRecords = async (
  eventId: string | number,
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = "name",
  sortDirection: "asc" | "desc" = "asc",
  filterProgram?: string,
  searchQuery?: string
): Promise<{
  records: AttendanceRecord[];
  total: number;
}> => {
  // Convert to string for comparison
  const eventIdStr = String(eventId);

  // Filter records by event ID
  let filteredRecords = mockAttendanceRecords.filter(
    (record) => String(record.eventId) === eventIdStr
  );

  // Apply program filter if provided
  if (filterProgram) {
    filteredRecords = filteredRecords.filter(
      (record) => record.student.programId === filterProgram
    );
  }

  // Apply search query if provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredRecords = filteredRecords.filter(
      (record) =>
        record.student.firstName.toLowerCase().includes(query) ||
        record.student.lastName.toLowerCase().includes(query) ||
        record.student.studentId.toLowerCase().includes(query)
    );
  }

  // Sort records
  filteredRecords.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        const nameA =
          `${a.student.lastName}, ${a.student.firstName}`.toLowerCase();
        const nameB =
          `${b.student.lastName}, ${b.student.firstName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case "program":
        const programA = `${getProgramName(a.student.programId)}-${
          a.student.yearLevel
        }`.toLowerCase();
        const programB = `${getProgramName(b.student.programId)}-${
          b.student.yearLevel
        }`.toLowerCase();
        comparison = programA.localeCompare(programB);
        break;
      case "timestamp":
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        comparison = timeA - timeB;
        break;
      case "id":
        comparison = a.student.studentId.localeCompare(b.student.studentId);
        break;
      default:
        comparison = a.student.lastName.localeCompare(b.student.lastName);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + pageSize
  );

  return {
    records: paginatedRecords,
    total: filteredRecords.length,
  };
};

// Get unique programs from members for filtering
export const getUniquePrograms = (): { id: string; name: string }[] => {
  const uniqueProgramIds = [...new Set(mockMembers.map((m) => m.programId))];
  return uniqueProgramIds.map((id) => ({
    id,
    name: `${getProgramName(id)}`,
  }));
};
