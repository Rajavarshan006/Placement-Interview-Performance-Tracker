import type { PlacedStudent } from '../types';

/**
 * Mock data for placed students.
 *
 * ASSUMPTION: This represents students who have been placed (final_status === "SELECTED").
 * Based on backend seed.py, two students got selected: Sneha (Zoho) and Priya (Infosys).
 *
 * Access status is a mock frontend state for demonstration purposes only.
 * The actual access control logic will be implemented by the backend team.
 *
 * In a real implementation, this data would come from:
 * GET /api/coordinator/{coordinatorId}/placed-students
 */
export const mockPlacedStudents: PlacedStudent[] = [
  {
    studentId: '1',
    name: 'Sneha Gupta',
    registerNumber: '2021CS108',
    department: 'CSE',
    email: 'sneha@college.edu',
    cgpa: 9.0,
    placedCompany: 'Zoho',
    rolePlaced: 'Member Technical Staff',
    packageLpa: 8.0,
    accessStatus: 'ACTIVE',
  },
  {
    studentId: '2',
    name: 'Priya Nair',
    registerNumber: '2021CS106',
    department: 'CSE',
    email: 'priyan@college.edu',
    cgpa: 8.1,
    placedCompany: 'Infosys',
    rolePlaced: 'Systems Engineer',
    packageLpa: 5.0,
    accessStatus: 'NO_ACCESS',
  },
  {
    studentId: '3',
    name: 'Ananya Reddy',
    registerNumber: '2021CS102',
    department: 'CSE',
    email: 'ananya@college.edu',
    cgpa: 8.5,
    placedCompany: 'TCS',
    rolePlaced: 'Software Developer',
    packageLpa: 7.5,
    accessStatus: 'ACTIVE',
  },
  {
    studentId: '4',
    name: 'Rahul Sharma',
    registerNumber: '2021CS101',
    department: 'CSE',
    email: 'rahul@college.edu',
    cgpa: 7.8,
    placedCompany: 'Wipro',
    rolePlaced: 'Project Engineer',
    packageLpa: 6.0,
    accessStatus: 'NO_ACCESS',
  },
  {
    studentId: '5',
    name: 'Vikram Patel',
    registerNumber: '2021IT103',
    department: 'IT',
    email: 'vikram@college.edu',
    cgpa: 6.9,
    placedCompany: 'Cognizant',
    rolePlaced: 'Programmer Analyst',
    packageLpa: 4.5,
    accessStatus: 'NO_ACCESS',
  },
];
