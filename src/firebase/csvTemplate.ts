/**
 * CSV Template Generator for Bulk Member Import
 * Provides functionality to generate and download a properly formatted CSV template
 * that users can fill out and upload for bulk member import
 */

// Interface defining the structure of the CSV template
interface CSVTemplateColumn {
  name: string;           // Column header name
  description: string;    // Human-readable description of the field
  required: boolean;      // Whether this field is mandatory
  example: string;        // Sample data to show expected format
}

// Define the template structure with all required and optional columns
const CSV_TEMPLATE_COLUMNS: CSVTemplateColumn[] = [
  {
    name: 'studentId',
    description: 'Student ID number',
    required: true,
    example: '20-1-01701'
  },
  {
    name: 'firstName',
    description: 'First name',
    required: true,
    example: 'John'
  },
  {
    name: 'lastName',
    description: 'Last name',
    required: true,
    example: 'Doe'
  },
  {
    name: 'email',
    description: 'Email address',
    required: true,
    example: 'john.doe@example.com'
  },
  {
    name: 'programId',
    description: 'Full program name (e.g., "BS in Computer Science")',
    required: true,
    example: 'BS in Computer Science'
  },
  {
    name: 'facultyId',
    description: 'Full faculty name (e.g., "Faculty of Computing")',
    required: true,
    example: 'Faculty of Computing'
  },
  {
    name: 'yearLevel',
    description: 'Year level (1-5, optional)',
    required: false,
    example: '3'
  }
];

// Sample data rows to include in the template for user guidance
const SAMPLE_TEMPLATE_DATA = [
  {
    studentId: '20-1-01701',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    programId: 'BS in Computer Science',
    facultyId: 'Faculty of Computing',
    yearLevel: '3'
  },
  {
    studentId: '20-1-01702',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    programId: 'BS in Environmental Science',
    facultyId: 'Faculty of Forestry and Environmental Sciences',
    yearLevel: '2'
  },
  {
    studentId: '21-2-01703',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    programId: 'BS in Civil Engineering',
    facultyId: 'Faculty of Engineering',
    yearLevel: '4'
  },
  {
    studentId: '22-1-01704',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    programId: 'BS in Computer Science',
    facultyId: 'Faculty of Computing',
    yearLevel: '1'
  },
  {
    studentId: '21-3-01705',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    programId: 'BS in Environmental Science',
    facultyId: 'Faculty of Forestry and Environmental Sciences',
    yearLevel: '3'
  },
  {
    studentId: '20-2-01706',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    programId: 'BS in Civil Engineering',
    facultyId: 'Faculty of Engineering',
    yearLevel: '4'
  },
  {
    studentId: '22-1-01707',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@example.com',
    programId: 'BS in Computer Science',
    facultyId: 'Faculty of Computing',
    yearLevel: '1'
  },
  {
    studentId: '21-2-01708',
    firstName: 'Lisa',
    lastName: 'Martinez',
    email: 'lisa.martinez@example.com',
    programId: 'BS in Environmental Science',
    facultyId: 'Faculty of Forestry and Environmental Sciences',
    yearLevel: '2'
  },
  {
    studentId: '20-3-01709',
    firstName: 'Robert',
    lastName: 'Garcia',
    email: 'robert.garcia@example.com',
    programId: 'BS in Civil Engineering',
    facultyId: 'Faculty of Engineering',
    yearLevel: '5'
  },
  {
    studentId: '22-2-01710',
    firstName: 'Michelle',
    lastName: 'Anderson',
    email: 'michelle.anderson@example.com',
    programId: 'BS in Computer Science',
    facultyId: 'Faculty of Computing',
    yearLevel: '1'
  },
  {
    studentId: '21-1-01711',
    firstName: 'Kevin',
    lastName: 'Taylor',
    email: 'kevin.taylor@example.com',
    programId: 'BS in Environmental Science',
    facultyId: 'Faculty of Forestry and Environmental Sciences',
    yearLevel: '3'
  },
  {
    studentId: '20-1-01712',
    firstName: 'Amanda',
    lastName: 'Thomas',
    email: 'amanda.thomas@example.com',
    programId: 'BS in Civil Engineering',
    facultyId: 'Faculty of Engineering',
    yearLevel: '4'
  },
  {
    studentId: '22-3-01713',
    firstName: 'Christopher',
    lastName: 'Jackson',
    email: 'christopher.jackson@example.com',
    programId: 'BS in Computer Science',
    facultyId: 'Faculty of Computing',
    yearLevel: '1'
  },
  {
    studentId: '21-2-01714',
    firstName: 'Nicole',
    lastName: 'White',
    email: 'nicole.white@example.com',
    programId: 'BS in Environmental Science',
    facultyId: 'Faculty of Forestry and Environmental Sciences',
    yearLevel: '2'
  },
  {
    studentId: '20-3-01715',
    firstName: 'Ryan',
    lastName: 'Harris',
    email: 'ryan.harris@example.com',
    programId: 'BS in Civil Engineering',
    facultyId: 'Faculty of Engineering',
    yearLevel: '5'
  }
];

/**
 * Generates CSV content string with headers and sample data
 * Creates a properly formatted CSV that users can download and modify
 * @param includeSampleData - Whether to include sample rows for guidance
 * @returns CSV content as string
 */
export const generateCSVTemplate = (includeSampleData: boolean = true): string => {
  // Create header row from column definitions
  const headers = CSV_TEMPLATE_COLUMNS.map(col => col.name);
  
  // Start with header row
  let csvContent = headers.join(',') + '\n';
  
  // Add sample data rows if requested
  if (includeSampleData) {
    SAMPLE_TEMPLATE_DATA.forEach(row => {
      // Create row by mapping each header to its value in the sample data
      const rowValues = headers.map(header => {
        const value = row[header as keyof typeof row] || '';
        // Wrap values in quotes if they contain commas or special characters
        return value.includes(',') || value.includes('"') ? `"${value}"` : value;
      });
      csvContent += rowValues.join(',') + '\n';
    });
  }
  
  return csvContent;
};

/**
 * Creates a downloadable blob from CSV content
 * Prepares the CSV data for browser download with proper MIME type
 * @param csvContent - The CSV content string
 * @returns Blob object ready for download
 */
export const createCSVBlob = (csvContent: string): Blob => {
  // Create blob with CSV MIME type and UTF-8 encoding
  return new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
};

/**
 * Generates a filename for the CSV template with timestamp
 * Creates a unique filename to prevent overwrites
 * @returns Formatted filename string
 */
export const generateTemplateFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, ''); // Format: YYYYMMDDTHHMMSS
  return `members_import_template_${timestamp}.csv`;
};

/**
 * Main function to trigger CSV template download
 * This function orchestrates the entire download process:
 * 1. Generates CSV content
 * 2. Creates downloadable blob
 * 3. Triggers browser download
 * @param includeSampleData - Whether to include sample rows in the template
 * @param filename - Optional custom filename (auto-generated if not provided)
 */
export const downloadCSVTemplate = (
  includeSampleData: boolean = true,
  filename?: string
): void => {
  try {
    // Generate the CSV content
    const csvContent = generateCSVTemplate(includeSampleData);
    
    // Create blob for download
    const blob = createCSVBlob(csvContent);
    
    // Generate filename if not provided
    const downloadFilename = filename || generateTemplateFilename();
    
    // Create temporary download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Configure the download link
    link.href = url;
    link.download = downloadFilename;
    link.style.display = 'none'; // Hide the link element
    
    // Add to DOM, trigger click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL to prevent memory leaks
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error downloading CSV template:', error);
    throw new Error('Failed to download CSV template. Please try again.');
  }
};

/**
 * Gets template column information for display in UI
 * Provides metadata about template structure for user guidance
 * @returns Array of column information objects
 */
export const getTemplateColumnInfo = (): CSVTemplateColumn[] => {
  return [...CSV_TEMPLATE_COLUMNS]; // Return copy to prevent external modification
};

/**
 * Validates if uploaded CSV has the required headers
 * Compares uploaded file headers against template requirements
 * @param uploadedHeaders - Array of headers from uploaded CSV
 * @returns Object with validation result and missing headers
 */
export const validateCSVHeaders = (uploadedHeaders: string[]): {
  isValid: boolean;
  missingRequired: string[];
  extraHeaders: string[];
} => {
  // Get required header names
  const requiredHeaders = CSV_TEMPLATE_COLUMNS
    .filter(col => col.required)
    .map(col => col.name);
  
  // Get all template header names
  const allTemplateHeaders = CSV_TEMPLATE_COLUMNS.map(col => col.name);
  
  // Check for missing required headers
  const missingRequired = requiredHeaders.filter(
    header => !uploadedHeaders.includes(header)
  );
  
  // Check for extra headers not in template
  const extraHeaders = uploadedHeaders.filter(
    header => !allTemplateHeaders.includes(header)
  );
  
  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    extraHeaders
  };
};

/**
 * Utility function to get CSV template as string for preview
 * Useful for showing users what the template looks like before download
 * @param includeSampleData - Whether to include sample data in preview
 * @returns Formatted preview string
 */
export const getTemplatePreview = (includeSampleData: boolean = false): string => {
  const csvContent = generateCSVTemplate(includeSampleData);
  const lines = csvContent.trim().split('\n');
  
  // Format for display with line numbers
  return lines
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');
};
