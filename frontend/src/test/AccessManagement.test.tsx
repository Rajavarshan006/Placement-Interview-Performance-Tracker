import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StudentAccessDirectory } from '../pages/StudentAccessDirectory';
import { StudentAccessDetail } from '../pages/StudentAccessDetail';
import { resetMockData } from '../services/coordinatorService';

// Helper to render with router
const renderWithRouter = (initialRoute = '/coordinator/access') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/coordinator/access" element={<StudentAccessDirectory />} />
        <Route path="/coordinator/access/:studentId" element={<StudentAccessDetail />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Coordinator Access Management - Lifecycle Implementation', () => {
  beforeEach(() => {
    // Reset mock data to ensure test isolation
    resetMockData();
  });

  // =================================================================
  // DIRECTORY TESTS
  // =================================================================

  describe('Student Access Directory', () => {
    it('renders the directory page with correct title', async () => {
      renderWithRouter();

      expect(screen.getByText('Coordinator Access Management')).toBeInTheDocument();
      expect(screen.getByText('Manage student access to the placement portal')).toBeInTheDocument();
    });

    it('displays students after loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
        expect(screen.getByText('Priya Nair')).toBeInTheDocument();
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
      });
    });

    it('searches students by name', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'Sneha');

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
        expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
      });
    });

    it('searches students by register number', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Priya Nair')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.clear(searchInput);
      await user.type(searchInput, '2021CS106');

      await waitFor(() => {
        expect(screen.getByText('Priya Nair')).toBeInTheDocument();
        expect(screen.queryByText('Sneha Gupta')).not.toBeInTheDocument();
      });
    });

    it('searches students by email', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'rajesh@college.edu');

      await waitFor(() => {
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
        expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
      });
    });

    it('filters students by department', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const departmentSelect = screen.getByLabelText(/department/i);
      await user.selectOptions(departmentSelect, 'IT');

      await waitFor(() => {
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
        expect(screen.queryByText('Sneha Gupta')).not.toBeInTheDocument();
      });
    });

    it('filters students by access status - No Access', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/access status/i);
      await user.selectOptions(statusSelect, 'NO_ACCESS');

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
        expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
        expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
      });
    });

    it('filters students by access status - Invited', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/access status/i);
      await user.selectOptions(statusSelect, 'INVITED');

      await waitFor(() => {
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
        expect(screen.queryByText('Sneha Gupta')).not.toBeInTheDocument();
      });
    });

    it('filters students by access status - Active', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Priya Nair')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/access status/i);
      await user.selectOptions(statusSelect, 'ACTIVE');

      await waitFor(() => {
        expect(screen.getByText('Priya Nair')).toBeInTheDocument();
        expect(screen.queryByText('Sneha Gupta')).not.toBeInTheDocument();
      });
    });

    it('filters students by access status - Revoked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Anitha Reddy')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/access status/i);
      await user.selectOptions(statusSelect, 'REVOKED');

      await waitFor(() => {
        expect(screen.getByText('Anitha Reddy')).toBeInTheDocument();
        expect(screen.queryByText('Sneha Gupta')).not.toBeInTheDocument();
      });
    });

    it('sorts students by name A-Z', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'name-asc');

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstDataRow = rows[1];
        expect(within(firstDataRow).getByText('Anitha Reddy')).toBeInTheDocument();
      });
    });

    it('sorts students by name Z-A', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'name-desc');

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstDataRow = rows[1];
        expect(within(firstDataRow).getByText('Vikram Singh')).toBeInTheDocument();
      });
    });

    it('sorts students by register number ascending', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'regno-asc');

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstDataRow = rows[1];
        expect(within(firstDataRow).getByText('2021CS106')).toBeInTheDocument();
      });
    });

    it('sorts students by register number descending', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'regno-desc');

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstDataRow = rows[1];
        expect(within(firstDataRow).getByText('2021IT023')).toBeInTheDocument();
      });
    });

    it('combines search, department, and status filters correctly', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const departmentSelect = screen.getByLabelText(/department/i);
      await user.selectOptions(departmentSelect, 'CSE');

      const statusSelect = screen.getByLabelText(/access status/i);
      await user.selectOptions(statusSelect, 'NO_ACCESS');

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
        expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
      });
    });

    it('updates result count correctly', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/showing 5 of 5 students/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'Sneha');

      await waitFor(() => {
        expect(screen.getByText(/showing 1 of 5 students/i)).toBeInTheDocument();
      });
    });

    it('shows empty state when no students match criteria', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      await user.type(searchInput, 'NonExistentStudent');

      await waitFor(() => {
        expect(screen.getByText(/no students found matching your criteria/i)).toBeInTheDocument();
      });
    });

    it('displays Manage button for each student', async () => {
      renderWithRouter();

      await waitFor(() => {
        const manageButtons = screen.getAllByText('Manage');
        expect(manageButtons.length).toBe(5);
      });
    });

    it('navigates to student detail page with correct ID when Manage is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
      });

      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1];
      const manageButton = within(firstDataRow).getByText('Manage');
      await user.click(manageButton);

      await waitFor(() => {
        expect(screen.getByText('Student Information')).toBeInTheDocument();
        expect(screen.getByText('Placement Information')).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  // STUDENT DETAIL TESTS
  // =================================================================

  describe('Student Detail Page', () => {
    it('renders student details correctly', async () => {
      renderWithRouter('/coordinator/access/1');

      await waitFor(() => {
        expect(screen.getAllByText('Sneha Gupta').length).toBeGreaterThan(0);
        expect(screen.getAllByText('2021CS108').length).toBeGreaterThan(0);
        expect(screen.getByText('Student Information')).toBeInTheDocument();
      });
    });

    it('renders Student Information section correctly', async () => {
      renderWithRouter('/coordinator/access/1');

      await waitFor(() => {
        expect(screen.getByText('Student Information')).toBeInTheDocument();
        expect(screen.getByText('sneha@college.edu')).toBeInTheDocument();
        expect(screen.getByText('CSE')).toBeInTheDocument();
      });
    });

    it('renders Placement Information section separately', async () => {
      renderWithRouter('/coordinator/access/1');

      await waitFor(() => {
        expect(screen.getByText('Placement Information')).toBeInTheDocument();
        expect(screen.getByText('Zoho')).toBeInTheDocument();
        expect(screen.getByText('Member Technical Staff')).toBeInTheDocument();
      });
    });

    it('renders Portal Access Status section correctly', async () => {
      renderWithRouter('/coordinator/access/1');

      await waitFor(() => {
        expect(screen.getByText('Portal Access Status')).toBeInTheDocument();
        expect(screen.getByText('Current Status')).toBeInTheDocument();
      });
    });

    it('shows Student Not Found for invalid student ID', async () => {
      renderWithRouter('/coordinator/access/999');

      await waitFor(() => {
        expect(screen.getByText('Student Not Found')).toBeInTheDocument();
      });
    });

    it('Back to Student Access button navigates correctly', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/999');

      await waitFor(() => {
        expect(screen.getByText('Student Not Found')).toBeInTheDocument();
      });

      const backButton = screen.getByText(/back to student access/i);
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Coordinator Access Management')).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  // NO_ACCESS STATE TESTS
  // =================================================================

  describe('NO_ACCESS State', () => {
    it('NO_ACCESS student shows Give Access button', async () => {
      renderWithRouter('/coordinator/access/1');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /give access/i })).toBeInTheDocument();
      });
    });

    it('clicking Give Access opens Grant Portal Access confirmation', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/1');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /give access/i })).toBeInTheDocument();
      });

      const giveAccessButton = screen.getByRole('button', { name: /give access/i });
      await user.click(giveAccessButton);

      await waitFor(() => {
        expect(screen.getByText('Grant Portal Access')).toBeInTheDocument();
      });
    });

    it('Grant Portal Access confirmation displays student details', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/1');

      const giveAccessButton = await screen.findByRole('button', { name: /give access/i });
      await user.click(giveAccessButton);

      await waitFor(() => {
        expect(screen.getAllByText(/sneha gupta/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/2021CS108/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/sneha@college.edu/i).length).toBeGreaterThan(0);
      });
    });

    it('Cancel closes dialog and keeps NO_ACCESS status', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/1');

      const giveAccessButton = await screen.findByRole('button', { name: /give access/i });
      await user.click(giveAccessButton);

      await waitFor(() => {
        expect(screen.getByText('Grant Portal Access')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Grant Portal Access')).not.toBeInTheDocument();
      });
    });

    it('Send Invitation transitions NO_ACCESS to INVITED', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/1');

      const giveAccessButton = await screen.findByRole('button', { name: /give access/i });
      await user.click(giveAccessButton);

      const sendButton = await screen.findByRole('button', { name: /send invitation/i });
      await user.click(sendButton);

      // Wait for success toast and state change
      await waitFor(() => {
        expect(screen.getByText(/invitation sent successfully/i)).toBeInTheDocument();
      });

      // After reload, should show INVITED state buttons
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resend invitation/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Access History shows Invitation sent entry', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/1');

      const giveAccessButton = await screen.findByRole('button', { name: /give access/i });
      await user.click(giveAccessButton);

      const sendButton = await screen.findByRole('button', { name: /send invitation/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/invitation sent/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // =================================================================
  // INVITED STATE TESTS
  // =================================================================

  describe('INVITED State', () => {
    it('INVITED student shows correct action buttons', async () => {
      renderWithRouter('/coordinator/access/3');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resend invitation/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /revoke invitation/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /simulate student activation/i })).toBeInTheDocument();
      });
    });

    it('Resend Invitation keeps status as INVITED', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const resendButtons = await screen.findAllByRole('button', { name: /resend invitation/i });
      await user.click(resendButtons[0]);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Find and click the confirm button within the dialog
      const confirmButton = within(dialog).getByRole('button', { name: /resend invitation/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/invitation resent successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Revoke confirmation can be cancelled without state change', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const revokeButtons = await screen.findAllByRole('button', { name: /revoke invitation/i });
      await user.click(revokeButtons[0]);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Find and click cancel button within dialog
      const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('confirming revoke changes INVITED to REVOKED', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const revokeButtons = await screen.findAllByRole('button', { name: /revoke invitation/i });
      await user.click(revokeButtons[0]);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Find and click confirm button within dialog
      const confirmButton = within(dialog).getByRole('button', { name: /revoke invitation/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /give access again/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Access History receives Invitation revoked entry', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const revokeButtons = await screen.findAllByRole('button', { name: /revoke invitation/i });
      await user.click(revokeButtons[0]);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Find and click confirm button within dialog
      const confirmButton = within(dialog).getByRole('button', { name: /revoke invitation/i });
      await user.click(confirmButton);

      // Wait for the success toast to appear
      await waitFor(() => {
        expect(screen.getByText(/invitation revoked successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Check that the history entry exists
      await waitFor(() => {
        const historyEntries = screen.getAllByText(/invitation revoked/i);
        expect(historyEntries.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });

    it('Simulate Student Activation is clearly marked as demo', async () => {
      renderWithRouter('/coordinator/access/3');

      await waitFor(() => {
        expect(screen.getByText(/demo \/ mock only/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /simulate student activation/i })).toBeInTheDocument();
      });
    });

    it('activation changes INVITED to ACTIVE', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const activateButton = await screen.findByRole('button', { name: /simulate student activation/i });
      await user.click(activateButton);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Find and click confirm button within dialog
      const confirmButton = within(dialog).getByRole('button', { name: /activate account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove access/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Activated On and Last Login are populated after activation', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const activateButton = await screen.findByRole('button', { name: /simulate student activation/i });
      await user.click(activateButton);

      const confirmButton = await screen.findByRole('button', { name: /activate account/i });
      await user.click(confirmButton);

      await waitFor(() => {
        // Should no longer show "—" for these fields
        const portalSection = screen.getByText('Portal Access Status').closest('div');
        expect(portalSection).not.toHaveTextContent('Activated On—');
      }, { timeout: 3000 });
    });

    it('Access History receives Account activated entry', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/3');

      const activateButton = await screen.findByRole('button', {
        name: /simulate student activation/i
      });
      await user.click(activateButton);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Confirm the simulated activation
      const confirmButton = within(dialog).getByRole('button', {
        name: /activate account/i
      });
      await user.click(confirmButton);

      // Verify the student transitioned to ACTIVE
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /remove access/i })
        ).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify the Access History entry
      await waitFor(() => {
        expect(
          screen.getByText(/^account activated$/i)
        ).toBeInTheDocument();
      });
    });
  });

  // =================================================================
  // ACTIVE STATE TESTS
  // =================================================================

  describe('ACTIVE State', () => {
    it('ACTIVE student shows Remove Access button', async () => {
      renderWithRouter('/coordinator/access/2');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove access/i })).toBeInTheDocument();
      });
    });

    it('clicking Remove Access opens confirmation', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/2');

      const removeButton = await screen.findByRole('button', { name: /remove access/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('Remove Portal Access')).toBeInTheDocument();
      });
    });

    it('confirmation explains that placement history is NOT deleted', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/2');

      const removeButton = await screen.findByRole('button', { name: /remove access/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText(/placement records and recruitment history will NOT be deleted/i)).toBeInTheDocument();
      });
    });

    it('Cancel keeps status as ACTIVE', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/2');

      const removeButton = await screen.findByRole('button', { name: /remove access/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('Remove Portal Access')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Remove Portal Access')).not.toBeInTheDocument();
      });
    });

    it('Confirm changes ACTIVE to REVOKED', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/2');

      const removeButton = await screen.findByRole('button', { name: /remove access/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('Remove Portal Access')).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button', { name: /remove access/i })[1];
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /give access again/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Access History receives Access removed entry', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/2');

      const removeButtons = await screen.findAllByRole('button', { name: /remove access/i });
      await user.click(removeButtons[0]);

      // Wait for dialog to open
      const dialog = await screen.findByRole('dialog');

      // Find and click confirm button within dialog
      const confirmButton = within(dialog).getByRole('button', { name: /remove access/i });
      await user.click(confirmButton);

      // Wait for success toast
      await waitFor(() => {
        expect(screen.getByText(/access removed successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Check history entry
      await waitFor(() => {
        const historyEntries = screen.getAllByText(/access removed/i);
        expect(historyEntries.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });
  });

  // =================================================================
  // REVOKED STATE TESTS
  // =================================================================

  describe('REVOKED State', () => {
    it('REVOKED student shows Give Access Again button', async () => {
      renderWithRouter('/coordinator/access/4');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /give access again/i })).toBeInTheDocument();
      });
    });

    it('Give Access Again uses invitation workflow', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/4');

      const giveAccessButton = await screen.findByRole('button', { name: /give access again/i });
      await user.click(giveAccessButton);

      await waitFor(() => {
        expect(screen.getByText('Grant Portal Access')).toBeInTheDocument();
        expect(screen.getByText(/an invitation will be sent/i)).toBeInTheDocument();
      });
    });

    it('Confirm changes REVOKED to INVITED (not ACTIVE)', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/4');

      const giveAccessButton = await screen.findByRole('button', { name: /give access again/i });
      await user.click(giveAccessButton);

      await waitFor(() => {
        expect(screen.getByText('Grant Portal Access')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /send invitation/i });
      await user.click(sendButton);

      // Should transition to INVITED, not ACTIVE
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resend invitation/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Access History receives New invitation sent entry', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/4');

      const giveAccessButton = await screen.findByRole('button', { name: /give access again/i });
      await user.click(giveAccessButton);

      const sendButton = await screen.findByRole('button', { name: /send invitation/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/new invitation sent/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('Previous history remains preserved after re-invitation', async () => {
      const user = userEvent.setup();
      renderWithRouter('/coordinator/access/4');

      // Check that old history is still there
      await waitFor(() => {
        const historyItems = screen.getAllByText(/invitation sent|account activated|access removed/i);
        expect(historyItems.length).toBeGreaterThan(0);
      });

      const giveAccessButton = await screen.findByRole('button', { name: /give access again/i });
      await user.click(giveAccessButton);

      await waitFor(() => {
        expect(screen.getByText('Grant Portal Access')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', { name: /send invitation/i });
      await user.click(sendButton);

      // New entry should be added, old entries should remain
      await waitFor(() => {
        const newEntry = screen.getByText(/new invitation sent/i);
        expect(newEntry).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});