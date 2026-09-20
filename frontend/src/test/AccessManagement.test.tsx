import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessManagement } from '../pages/AccessManagement';
import * as coordinatorService from '../services/coordinatorService';

// Mock the coordinator service
vi.mock('../services/coordinatorService');

describe('AccessManagement', () => {
  const mockStudents = [
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
      accessStatus: 'ACTIVE' as const,
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
      accessStatus: 'NO_ACCESS' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementation
    vi.mocked(coordinatorService.getPlacedStudents).mockResolvedValue(
      mockStudents
    );
  });

  it('renders the access management page', async () => {
    render(<AccessManagement />);

    expect(
      screen.getByText('Coordinator Access Management')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Manage access permissions for placed students')
    ).toBeInTheDocument();
  });

  it('displays placed students after loading', async () => {
    render(<AccessManagement />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });
  });

  it('shows "Give Access" button for students without access', async () => {
    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });

    // Priya has NO_ACCESS, should show Give Access button
    const giveAccessButtons = screen.getAllByText('Give Access');
    expect(giveAccessButtons.length).toBeGreaterThan(0);
  });

  it('shows "Remove Access" button for students with active access', async () => {
    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
    });

    // Sneha has ACTIVE access, should show Remove Access button
    const removeAccessButtons = screen.getAllByText('Remove Access');
    expect(removeAccessButtons.length).toBeGreaterThan(0);
  });

  it('opens confirmation dialog when Give Access is clicked', async () => {
    const user = userEvent.setup();
    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });

    // Click Give Access button for Priya
    const giveAccessButton = screen.getAllByText('Give Access')[0];
    await user.click(giveAccessButton);

    // Check confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Give Access Confirmation')).toBeInTheDocument();
    });
  });

  it('closes dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });

    // Click Give Access
    const giveAccessButton = screen.getAllByText('Give Access')[0];
    await user.click(giveAccessButton);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('Give Access Confirmation')).toBeInTheDocument();
    });

    // Click Cancel
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    // Dialog should close
    await waitFor(() => {
      expect(
        screen.queryByText('Give Access Confirmation')
      ).not.toBeInTheDocument();
    });
  });

  it('calls giveAccess service when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(coordinatorService.giveAccess).mockResolvedValue({
      success: true,
      message: 'Access granted successfully',
      studentId: '2',
    });

    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });

    // Click Give Access
    const giveAccessButton = screen.getAllByText('Give Access')[0];
    await user.click(giveAccessButton);

    // Wait for dialog and click confirm
    await waitFor(() => {
      expect(screen.getByText('Give Access Confirmation')).toBeInTheDocument();
    });

    const confirmButton = screen.getAllByText('Give Access')[1]; // Second one is in dialog
    await user.click(confirmButton);

    // Verify service was called
    await waitFor(() => {
      expect(coordinatorService.giveAccess).toHaveBeenCalledWith(
        'mock-coordinator-1',
        '2'
      );
    });
  });

  it('opens confirmation dialog when Remove Access is clicked', async () => {
    const user = userEvent.setup();
    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
    });

    // Click Remove Access button for Sneha
    const removeAccessButton = screen.getAllByText('Remove Access')[0];
    await user.click(removeAccessButton);

    // Check confirmation dialog appears
    await waitFor(() => {
      expect(
        screen.getByText('Remove Access Confirmation')
      ).toBeInTheDocument();
    });
  });

  it('calls removeAccess service when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(coordinatorService.removeAccess).mockResolvedValue({
      success: true,
      message: 'Access removed successfully',
      studentId: '1',
    });

    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
    });

    // Click Remove Access
    const removeAccessButton = screen.getAllByText('Remove Access')[0];
    await user.click(removeAccessButton);

    // Wait for dialog and click confirm
    await waitFor(() => {
      expect(
        screen.getByText('Remove Access Confirmation')
      ).toBeInTheDocument();
    });

    const confirmButton = screen.getAllByText('Remove Access')[1];
    await user.click(confirmButton);

    // Verify service was called
    await waitFor(() => {
      expect(coordinatorService.removeAccess).toHaveBeenCalledWith(
        'mock-coordinator-1',
        '1'
      );
    });
  });

  it('filters students by search query', async () => {
    const user = userEvent.setup();
    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });

    // Search for Sneha
    const searchInput = screen.getByPlaceholderText(
      'Search by name or register number...'
    );
    await user.type(searchInput, 'Sneha');

    // Only Sneha should be visible
    await waitFor(() => {
      expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no students', async () => {
    vi.mocked(coordinatorService.getPlacedStudents).mockResolvedValue([]);

    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('No Placed Students')).toBeInTheDocument();
    });
  });

  it('displays error toast on service failure', async () => {
    const user = userEvent.setup();
    vi.mocked(coordinatorService.giveAccess).mockResolvedValue({
      success: false,
      message: 'Student already has access',
    });

    render(<AccessManagement />);

    await waitFor(() => {
      expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    });

    // Click Give Access
    const giveAccessButton = screen.getAllByText('Give Access')[0];
    await user.click(giveAccessButton);

    // Confirm
    await waitFor(() => {
      expect(screen.getByText('Give Access Confirmation')).toBeInTheDocument();
    });
    const confirmButton = screen.getAllByText('Give Access')[1];
    await user.click(confirmButton);

    // Error toast should appear
    await waitFor(() => {
      expect(
        screen.getByText('Student already has access')
      ).toBeInTheDocument();
    });
  });
});
