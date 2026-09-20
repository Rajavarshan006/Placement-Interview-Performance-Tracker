import type { PlacedStudent, AccessOperationResult } from '../types';
import { mockPlacedStudents } from '../data/mockPlacedStudents';

/**
 * Coordinator Service - Access Management
 *
 * This service provides an abstraction layer for coordinator access management operations.
 *
 * CURRENT IMPLEMENTATION: Mock/in-memory operations
 * FUTURE IMPLEMENTATION: Replace with actual API calls to backend
 *
 * Backend Integration Points (to be implemented):
 * - GET /api/coordinator/{coordinatorId}/placed-students
 * - POST /api/coordinator/{coordinatorId}/access/{studentId}
 * - DELETE /api/coordinator/{coordinatorId}/access/{studentId}
 */

// In-memory state for mock implementation
let studentsState: PlacedStudent[] = [...mockPlacedStudents];

// Simulated network delay for realistic UX
const simulateNetworkDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all placed students with their current access status
 *
 * FUTURE: Replace with actual API call
 * @param coordinatorId - The coordinator requesting the data
 * @returns Promise<PlacedStudent[]>
 */
export const getPlacedStudents = async (
  _coordinatorId?: string
): Promise<PlacedStudent[]> => {
  await simulateNetworkDelay(300);

  // Mock implementation: return in-memory state
  // Future: return await fetch(`/api/coordinator/${_coordinatorId}/placed-students`)
  return [...studentsState];
};

/**
 * Grant access to a placed student
 *
 * FUTURE: Replace with actual API call
 * @param coordinatorId - The coordinator granting access
 * @param studentId - The student to grant access to
 * @returns Promise<AccessOperationResult>
 */
export const giveAccess = async (
  _coordinatorId: string,
  studentId: string
): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(600);

  const student = studentsState.find((s) => s.studentId === studentId);

  if (!student) {
    return {
      success: false,
      message: 'Student not found',
    };
  }

  if (student.accessStatus === 'ACTIVE') {
    return {
      success: false,
      message: 'Student already has access',
    };
  }

  // Mock implementation: update in-memory state
  studentsState = studentsState.map((s) =>
    s.studentId === studentId ? { ...s, accessStatus: 'ACTIVE' } : s
  );

  // Future: await fetch(`/api/coordinator/${_coordinatorId}/access/${studentId}`, { method: 'POST' })

  return {
    success: true,
    message: `Access granted successfully to ${student.name}`,
    studentId,
  };
};

/**
 * Revoke access from a placed student
 *
 * FUTURE: Replace with actual API call
 * @param coordinatorId - The coordinator revoking access
 * @param studentId - The student to revoke access from
 * @returns Promise<AccessOperationResult>
 */
export const removeAccess = async (
  _coordinatorId: string,
  studentId: string
): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(600);

  const student = studentsState.find((s) => s.studentId === studentId);

  if (!student) {
    return {
      success: false,
      message: 'Student not found',
    };
  }

  if (student.accessStatus === 'NO_ACCESS') {
    return {
      success: false,
      message: 'Student does not have access',
    };
  }

  // Mock implementation: update in-memory state
  studentsState = studentsState.map((s) =>
    s.studentId === studentId ? { ...s, accessStatus: 'NO_ACCESS' } : s
  );

  // Future: await fetch(`/api/coordinator/${_coordinatorId}/access/${studentId}`, { method: 'DELETE' })

  return {
    success: true,
    message: `Access removed successfully from ${student.name}`,
    studentId,
  };
};

/**
 * Reset mock data to initial state (for testing purposes)
 */
export const resetMockData = () => {
  studentsState = [...mockPlacedStudents];
};
