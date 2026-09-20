import { useState, useEffect, useMemo } from 'react';
import type { PlacedStudent } from '../types';
import {
  getPlacedStudents,
  giveAccess,
  removeAccess,
} from '../services/coordinatorService';
import { AccessTable } from '../components/AccessTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, type ToastType } from '../components/Toast';

type ConfirmDialogState = {
  isOpen: boolean;
  type: 'give' | 'remove' | null;
  studentId: string | null;
  studentName: string;
};

type ToastState = {
  isVisible: boolean;
  message: string;
  type: ToastType;
};

/**
 * Access Management Page - Coordinator Dashboard
 *
 * Allows coordinators to manage access for placed students.
 * Implements giveAccess() and removeAccess() functionality from UML.
 *
 * ASSUMPTION: "Access" represents a state that coordinators can grant or revoke
 * for placed students. This is a mock frontend implementation until backend
 * defines the exact business logic.
 */
export const AccessManagement = () => {
  const [students, setStudents] = useState<PlacedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: null,
    studentId: null,
    studentName: '',
  });

  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'info',
  });

  // Mock coordinator ID (in real implementation, this would come from auth context)
  const coordinatorId = 'mock-coordinator-1';

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await getPlacedStudents(coordinatorId);
      setStudents(data);
    } catch (error) {
      showToast('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique departments for filter
  const departments = useMemo(() => {
    const uniqueDepts = new Set(students.map((s) => s.department));
    return ['ALL', ...Array.from(uniqueDepts)];
  }, [students]);

  // Filter students based on search and department
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === 'ALL' || student.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [students, searchQuery, departmentFilter]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleGiveAccessClick = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    if (!student) return;

    setConfirmDialog({
      isOpen: true,
      type: 'give',
      studentId,
      studentName: student.name,
    });
  };

  const handleRemoveAccessClick = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    if (!student) return;

    setConfirmDialog({
      isOpen: true,
      type: 'remove',
      studentId,
      studentName: student.name,
    });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.studentId || !confirmDialog.type) return;

    setIsProcessing(true);
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

    try {
      const result =
        confirmDialog.type === 'give'
          ? await giveAccess(coordinatorId, confirmDialog.studentId)
          : await removeAccess(coordinatorId, confirmDialog.studentId);

      if (result.success) {
        // Reload students to reflect changes
        await loadStudents();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('Operation failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      studentId: null,
      studentName: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Coordinator Access Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage access permissions for placed students
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search students
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name or register number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="department" className="sr-only">
              Filter by department
            </label>
            <select
              id="department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} placed students
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : (
          <AccessTable
            students={filteredStudents}
            onGiveAccess={handleGiveAccessClick}
            onRemoveAccess={handleRemoveAccessClick}
            isLoading={isProcessing}
          />
        )}
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === 'give'
            ? 'Give Access Confirmation'
            : 'Remove Access Confirmation'
        }
        message={
          confirmDialog.type === 'give'
            ? `Are you sure you want to grant access to ${confirmDialog.studentName}?`
            : `Are you sure you want to remove access from ${confirmDialog.studentName}? This action can be reversed later.`
        }
        confirmLabel={confirmDialog.type === 'give' ? 'Give Access' : 'Remove Access'}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isDestructive={confirmDialog.type === 'remove'}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};
