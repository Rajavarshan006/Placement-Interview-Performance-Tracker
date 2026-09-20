/**
 * Type definitions for Coordinator Access Management
 *
 * NOTE: These types are based on the backend Student and StudentDriveRegistration models.
 * "Placed students" are students with final_status === "SELECTED" in their registrations.
 */

export type AccessStatus = 'ACTIVE' | 'NO_ACCESS';

export interface PlacedStudent {
  studentId: string;
  name: string;
  registerNumber: string;
  department: string;
  email: string;
  cgpa: number;
  placedCompany: string;
  rolePlaced: string;
  packageLpa: number;
  accessStatus: AccessStatus;
}

export interface AccessOperationResult {
  success: boolean;
  message: string;
  studentId?: string;
}
