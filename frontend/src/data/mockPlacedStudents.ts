import type { PlacedStudent } from '../types';

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
    access: {
      status: 'NO_ACCESS',
      invitationSentAt: null,
      activatedAt: null,
      lastLoginAt: null,
      revokedAt: null,
      history: []
    }
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
    access: {
      status: 'ACTIVE',
      invitationSentAt: new Date('2026-09-10T10:00:00'),
      activatedAt: new Date('2026-09-11T15:30:00'),
      lastLoginAt: new Date('2026-09-19T09:15:00'),
      revokedAt: null,
      history: [
        {
          id: '1',
          action: 'Invitation sent',
          timestamp: new Date('2026-09-10T10:00:00'),
          actor: 'Coordinator'
        },
        {
          id: '2',
          action: 'Account activated',
          timestamp: new Date('2026-09-11T15:30:00')
        }
      ]
    }
  },
  {
    studentId: '3',
    name: 'Rajesh Kumar',
    registerNumber: '2021IT023',
    department: 'IT',
    email: 'rajesh@college.edu',
    cgpa: 8.5,
    placedCompany: 'TCS',
    rolePlaced: 'Software Engineer',
    packageLpa: 7.0,
    access: {
      status: 'INVITED',
      invitationSentAt: new Date('2026-09-18T14:00:00'),
      activatedAt: null,
      lastLoginAt: null,
      revokedAt: null,
      history: [
        {
          id: '1',
          action: 'Invitation sent',
          timestamp: new Date('2026-09-18T14:00:00'),
          actor: 'Coordinator'
        }
      ]
    }
  },
  {
    studentId: '4',
    name: 'Anitha Reddy',
    registerNumber: '2021ECE015',
    department: 'ECE',
    email: 'anitha@college.edu',
    cgpa: 7.9,
    placedCompany: 'Wipro',
    rolePlaced: 'Project Engineer',
    packageLpa: 4.5,
    access: {
      status: 'REVOKED',
      invitationSentAt: new Date('2026-08-15T09:00:00'),
      activatedAt: new Date('2026-08-16T11:00:00'),
      lastLoginAt: new Date('2026-09-05T16:00:00'),
      revokedAt: new Date('2026-09-15T10:00:00'),
      history: [
        {
          id: '1',
          action: 'Invitation sent',
          timestamp: new Date('2026-08-15T09:00:00'),
          actor: 'Coordinator'
        },
        {
          id: '2',
          action: 'Account activated',
          timestamp: new Date('2026-08-16T11:00:00')
        },
        {
          id: '3',
          action: 'Access removed',
          timestamp: new Date('2026-09-15T10:00:00'),
          actor: 'Coordinator'
        }
      ]
    }
  },
  {
    studentId: '5',
    name: 'Vikram Singh',
    registerNumber: '2021EEE042',
    department: 'EEE',
    email: 'vikram@college.edu',
    cgpa: 8.3,
    placedCompany: 'Accenture',
    rolePlaced: 'Associate Software Engineer',
    packageLpa: 6.5,
    access: {
      status: 'NO_ACCESS',
      invitationSentAt: null,
      activatedAt: null,
      lastLoginAt: null,
      revokedAt: null,
      history: []
    }
  }
];
