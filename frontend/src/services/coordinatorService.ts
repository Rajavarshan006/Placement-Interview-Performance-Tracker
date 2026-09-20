import type { PlacedStudent, AccessOperationResult } from '../types';
import { mockPlacedStudents } from '../data/mockPlacedStudents';

let studentsState: PlacedStudent[] = JSON.parse(JSON.stringify(mockPlacedStudents));

const simulateNetworkDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getPlacedStudents = async (_coordinatorId?: string): Promise<PlacedStudent[]> => {
  await simulateNetworkDelay(300);
  return JSON.parse(JSON.stringify(studentsState));
};

export const getStudentById = async (studentId: string): Promise<PlacedStudent | null> => {
  await simulateNetworkDelay(200);
  const student = studentsState.find(s => s.studentId === studentId);
  return student ? JSON.parse(JSON.stringify(student)) : null;
};

export const giveAccess = async (_coordinatorId: string, studentId: string): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(500);
  const student = studentsState.find(s => s.studentId === studentId);
  if (!student) return { success: false, message: 'Student not found' };
  
  if (student.access.status !== 'NO_ACCESS' && student.access.status !== 'REVOKED') {
    return { success: false, message: 'Cannot give access to student with current status' };
  }

  const now = new Date();
  student.access.status = 'INVITED';
  student.access.invitationSentAt = now;
  student.access.history.push({
    id: Date.now().toString(),
    action: student.access.revokedAt ? 'New invitation sent' : 'Invitation sent',
    timestamp: now,
    actor: 'Coordinator'
  });

  return { success: true, message: 'Invitation sent successfully', studentId };
};

export const resendInvitation = async (studentId: string): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(500);
  const student = studentsState.find(s => s.studentId === studentId);
  if (!student) return { success: false, message: 'Student not found' };
  if (student.access.status !== 'INVITED') {
    return { success: false, message: 'Can only resend invitation to invited students' };
  }

  const now = new Date();
  student.access.invitationSentAt = now;
  student.access.history.push({
    id: Date.now().toString(),
    action: 'Invitation resent',
    timestamp: now,
    actor: 'Coordinator'
  });

  return { success: true, message: 'Invitation resent successfully', studentId };
};

export const revokeInvitation = async (studentId: string): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(500);
  const student = studentsState.find(s => s.studentId === studentId);
  if (!student) return { success: false, message: 'Student not found' };
  if (student.access.status !== 'INVITED') {
    return { success: false, message: 'Can only revoke invitation for invited students' };
  }

  const now = new Date();
  student.access.status = 'REVOKED';
  student.access.revokedAt = now;
  student.access.history.push({
    id: Date.now().toString(),
    action: 'Invitation revoked',
    timestamp: now,
    actor: 'Coordinator'
  });

  return { success: true, message: 'Invitation revoked successfully', studentId };
};

export const removeAccess = async (_coordinatorId: string, studentId: string): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(500);
  const student = studentsState.find(s => s.studentId === studentId);
  if (!student) return { success: false, message: 'Student not found' };
  if (student.access.status !== 'ACTIVE') {
    return { success: false, message: 'Can only remove access from active students' };
  }

  const now = new Date();
  student.access.status = 'REVOKED';
  student.access.revokedAt = now;
  student.access.history.push({
    id: Date.now().toString(),
    action: 'Access removed',
    timestamp: now,
    actor: 'Coordinator'
  });

  return { success: true, message: 'Access removed successfully', studentId };
};

export const simulateActivation = async (studentId: string): Promise<AccessOperationResult> => {
  await simulateNetworkDelay(500);
  const student = studentsState.find(s => s.studentId === studentId);
  if (!student) return { success: false, message: 'Student not found' };
  if (student.access.status !== 'INVITED') {
    return { success: false, message: 'Can only activate invited students' };
  }

  const now = new Date();
  student.access.status = 'ACTIVE';
  student.access.activatedAt = now;
  student.access.lastLoginAt = now;
  student.access.history.push({
    id: Date.now().toString(),
    action: 'Account activated',
    timestamp: now
  });

  return { success: true, message: 'Account activated (demo)', studentId };
};

export const resetMockData = () => {
  studentsState = JSON.parse(JSON.stringify(mockPlacedStudents));
};
