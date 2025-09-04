import {
  collection,
  writeBatch,
  Timestamp,
  query,
  where,
  getDocs,
  CollectionReference,
  DocumentData,
  doc,
} from "firebase/firestore";
import { db } from "./firebase.config";
import { Member } from "@/features/organization/members/types";

// Define the collection reference for reuse across all functions
// This prevents creating the collection reference multiple times
const usersCollection: CollectionReference<DocumentData> = collection(
  db,
  "users"
);

// Interface for raw CSV row data before validation
// Includes rowNumber for error reporting and optional fields since CSV parsing may have missing values
interface RawMemberData {
  rowNumber: number;           // Track original CSV row for error reporting
  studentId?: string;          // Optional because validation will check for required fields
  firstName?: string;
  lastName?: string;
  email?: string;
  programId?: string;
  facultyId?: string;
  yearLevel?: string | number; // Can be string from CSV or number after parsing
  [key: string]: unknown;      // Allow additional CSV columns that we don't explicitly handle
}

// Centralized error handler for consistent error logging and messaging
const handleFirestoreError = (error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  throw new Error(`Failed to ${context}.`);
};

// Interface for bulk import result - provides comprehensive feedback to the UI
export interface BulkImportResult {
  success: boolean;                    // Overall operation success status
  totalProcessed: number;              // Total number of rows attempted to process
  successfulImports: number;           // Number of members successfully added to database
  errors: Array<{                     // Detailed error information for failed rows
    row: number;                       // Original CSV row number for easy reference
    studentId: string;                 // Student ID from the failed row (or 'N/A' if missing)
    error: string;                     // Human-readable error description
  }>;
  duplicates: string[];                // List of student IDs that already exist in database
}

// Interface for validated member data that passed all validation checks
// Extends Member interface but includes rowNumber for tracking during processing
interface ValidatedMemberData extends Member {
  rowNumber: number;                   // Keep track of original CSV row for error reporting
}

/**
 * Validates required fields for a member record from CSV data
 * Performs comprehensive validation including format checks for email and year level
 * @param data - Raw member data from CSV parsing
 * @returns Array of error messages (empty if validation passes)
 */
const validateMemberData = (data: RawMemberData): string[] => {
  const errors: string[] = [];
  
  // Check required string fields and ensure they're not empty after trimming
  if (!data.studentId || data.studentId.trim() === "") {
    errors.push("Student ID is required");
  }
  
  if (!data.firstName || data.firstName.trim() === "") {
    errors.push("First name is required");
  }
  
  if (!data.lastName || data.lastName.trim() === "") {
    errors.push("Last name is required");
  }
  
  // Email validation: check if exists and validate format
  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required");
  } else {
    // Basic email validation using regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  
  if (!data.programId || data.programId.trim() === "") {
    errors.push("Program ID is required");
  }
  
  if (!data.facultyId || data.facultyId.trim() === "") {
    errors.push("Faculty ID is required");
  }
  
  // Validate year level if provided (optional field)
  if (data.yearLevel !== undefined && data.yearLevel !== null) {
    // Handle both string and number inputs from CSV
    const yearLevel = typeof data.yearLevel === 'string' ? parseInt(data.yearLevel) : Number(data.yearLevel);
    if (isNaN(yearLevel) || yearLevel < 1) {
      errors.push("Year level must be a positive integer");
    }
  }
  
  return errors;
};

/**
 * Checks for existing student IDs in the database to prevent duplicates
 * Uses batched queries due to Firestore's 'in' operator limit of 10 items per query
 * @param studentIds - Array of student IDs to check
 * @returns Array of student IDs that already exist in the database
 */
const checkExistingStudentIds = async (studentIds: string[]): Promise<string[]> => {
  try {
    const existingIds: string[] = [];
    
    // batch by 10 due to query limitations ahahahaha
    const batchSize = 10;
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);
      
      // Query for existing student IDs in this batch
      const q = query(
        usersCollection,
        where("studentId", "in", batch),        // Check if studentId exists in current batch
        where("isDeleted", "==", false)        // Only check non-deleted records
      );
      
      const querySnapshot = await getDocs(q);
      // Extract student IDs from the found documents
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        existingIds.push(data.studentId);
      });
    }
    
    return existingIds;
  } catch (error) {
    handleFirestoreError(error, "check existing student IDs");
    return [];
  }
};

/**
 * Parses CSV content and returns array of member data
 * Handles CSV format validation, header verification, and data extraction
 * @param csvContent - Raw CSV file content as string
 * @returns Array of parsed member data with row numbers for error tracking
 */
export const parseCSVContent = (csvContent: string): RawMemberData[] => {
  // Split content into lines and remove any trailing whitespace
  const lines = csvContent.trim().split('\n');
  
  // Ensure minimum required structure (header + at least one data row)
  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header row and one data row");
  }
  
  // Get headers and normalize them (remove quotes, trim whitespace)
  // This handles CSV files that may have quoted headers
  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/^["']|["']$/g, '')
  );
  
  // Validate that all required headers are present
  const requiredHeaders = ['studentId', 'firstName', 'lastName', 'email', 'programId', 'facultyId'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }
  
  // Parse data rows starting from index 1 (skipping header row)
  const members: RawMemberData[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Skip completely empty lines
    if (lines[i].trim() === '') continue;
    
    // Split row into values and clean them (remove quotes, trim)
    const values = lines[i].split(',').map(value => 
      value.trim().replace(/^["']|["']$/g, '')
    );
    
    // Validate that row has correct number of columns
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1}: Number of values (${values.length}) doesn't match number of headers (${headers.length})`);
    }
    
    // Create member data object with row tracking
    const memberData: RawMemberData = { rowNumber: i + 1 }; // i + 1 gives actual CSV row number
    
    // Map each value to its corresponding header
    headers.forEach((header, index) => {
      memberData[header] = values[index] || null; // Use null for empty values
    });
    
    members.push(memberData);
  }
  
  return members;
};

/**
 * Main function to bulk import users from parsed data
 * Handles validation, duplicate checking, and batch writing to Firestore
 * @param memberData - Array of parsed member data from CSV
 * @returns Comprehensive result object with success status and detailed feedback
 */
export const bulkImportUsers = async (memberData: RawMemberData[]): Promise<BulkImportResult> => {
  // Initialize result object to track the entire operation
  const result: BulkImportResult = {
    success: false,
    totalProcessed: memberData.length,
    successfulImports: 0,
    errors: [],
    duplicates: []
  };
  
  try {
    // Step 1: Validate all member data before attempting any database operations
    const validatedMembers: ValidatedMemberData[] = [];
    
    for (const data of memberData) {
      // Run validation on current row
      const validationErrors = validateMemberData(data);
      
      // If validation fails, add to errors and skip this record
      if (validationErrors.length > 0) {
        result.errors.push({
          row: data.rowNumber,
          studentId: (data.studentId as string) || 'N/A',
          error: validationErrors.join(', ')
        });
        continue; // Skip to next record
      }
      
      // Create validated member object with proper typing and data cleaning
      const validatedMember: ValidatedMemberData = {
        rowNumber: data.rowNumber,
        studentId: (data.studentId as string).trim(),
        firstName: (data.firstName as string).trim(),
        lastName: (data.lastName as string).trim(),
        email: (data.email as string).trim().toLowerCase(), // Normalize email to lowercase
        programId: (data.programId as string).trim(),
        facultyId: (data.facultyId as string).trim(),
        role: "user", // Default role for bulk imported members
        yearLevel: data.yearLevel ? (typeof data.yearLevel === 'string' ? parseInt(data.yearLevel) : Number(data.yearLevel)) : undefined,
      };
      
      validatedMembers.push(validatedMember);
    }
    
    // Early exit if no valid members to process
    if (validatedMembers.length === 0) {
      result.success = false;
      return result;
    }
    
    // Step 2: Check for existing student IDs to prevent duplicates
    const studentIds = validatedMembers.map(member => member.studentId);
    const existingStudentIds = await checkExistingStudentIds(studentIds);
    
    // Filter out duplicates and track them for reporting
    const membersToImport = validatedMembers.filter(member => {
      if (existingStudentIds.includes(member.studentId)) {
        result.duplicates.push(member.studentId);
        return false; // Don't import this member
      }
      return true; // Import this member
    });
    
    // If all members were duplicates, return success but with zero imports
    if (membersToImport.length === 0) {
      result.success = true; // No errors, but all were duplicates
      return result;
    }
    
    // Step 3: Batch write to Firestore for efficiency
    // Using batch writes ensures atomicity - either all succeed or all fail
    const batch = writeBatch(db);
    const timestamp = Timestamp.now(); // Single timestamp for all records
    
    membersToImport.forEach(member => {
      // Generate new document reference for each member
      const docRef = doc(collection(db, "users"));
      
      // Prepare member data for database storage
      const memberDataForSave = {
        ...member,
        createdAt: timestamp,           // Add creation timestamp
        isDeleted: false,               // Default soft delete flag
      };
      
      // Remove rowNumber before saving to database (it's only for error tracking)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rowNumber, ...memberDataWithoutRow } = memberDataForSave;
      
      // Add this document creation to the batch
      batch.set(docRef, memberDataWithoutRow);
    });
    
    // Execute the batch write - this is atomic (all or nothing)
    await batch.commit();
    
    // Update result with success information
    result.successfulImports = membersToImport.length;
    result.success = true;
    
    return result;
    
  } catch (error) {
    // Handle any unexpected errors during the bulk import process
    handleFirestoreError(error, "bulk import users");
    result.success = false;
    return result;
  }
};

/**
 * Main function to handle file upload and bulk import
 * This is the primary entry point for the bulk import feature
 * Validates file type, reads content, parses CSV, and processes the import
 * @param file - The uploaded File object from the user
 * @returns Complete import result with success status and detailed feedback
 */
export const processFileForBulkImport = async (file: File): Promise<BulkImportResult> => {
  try {
    // Validate file type to ensure it's a CSV file
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    const validExtensions = ['.csv'];
    
    // Check both MIME type and file extension for better compatibility
    const hasValidType = validTypes.includes(file.type) || 
                        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType) {
      throw new Error("Invalid file type. Please upload a CSV file.");
    }
    
    // Read file content as text
    const fileContent = await file.text();
    
    // Parse CSV content into structured data
    const memberData = parseCSVContent(fileContent);
    
    // Process the bulk import with parsed data
    return await bulkImportUsers(memberData);
    
  } catch (error) {
    // Return error result if any step fails
    return {
      success: false,
      totalProcessed: 0,
      successfulImports: 0,
      errors: [{
        row: 0,                        // Row 0 indicates a file-level error
        studentId: 'N/A',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }],
      duplicates: []
    };
  }
};
