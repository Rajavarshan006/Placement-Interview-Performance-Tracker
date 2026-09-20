/**
 * Type definitions for Coordinator Access Management
 *
 * NOTE: These types are based on the backend Student and StudentDriveRegistration models.
 * "Placed students" are students with final_status === "SELECTED" in their registrations.
 */

export type AccessStatus = 'NO_ACCESS' | 'INVITED' | 'ACTIVE' | 'REVOKED';

export interface AccessHistoryEntry {
  id: string;
  action: string;
  timestamp: Date;
  actor?: string;
}

export interface PortalAccess {
  status: AccessStatus;
  invitationSentAt: Date | null;
  activatedAt: Date | null;
  lastLoginAt: Date | null;
  revokedAt: Date | null;
  history: AccessHistoryEntry[];
}

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
  access: PortalAccess;
}

export interface AccessOperationResult {
  success: boolean;
  message: string;
  studentId?: string;
}
