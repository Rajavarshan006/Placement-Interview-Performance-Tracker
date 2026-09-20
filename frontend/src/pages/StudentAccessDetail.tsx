import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PlacedStudent } from '../types';
import type { ToastType } from '../components/Toast';
import { getStudentById, giveAccess, resendInvitation, revokeInvitation, removeAccess, simulateActivation } from '../services/coordinatorService';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';

type DialogType = 'give-access' | 'resend' | 'revoke-invitation' | 'remove-access' | 'simulate-activation' | null;

export const StudentAccessDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<PlacedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const data = await getStudentById(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Failed to load student:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const handleGiveAccess = async () => {
    if (!studentId) return;
    try {
      const result = await giveAccess('coordinator-1', studentId);
      await loadStudent();
      setActiveDialog(null);
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to send invitation', 'error');
    }
  };

  const handleResend = async () => {
    if (!studentId) return;
    try {
      const result = await resendInvitation(studentId);
      await loadStudent();
      setActiveDialog(null);
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to resend invitation', 'error');
    }
  };

  const handleRevoke = async () => {
    if (!studentId) return;
    try {
      const result = await revokeInvitation(studentId);
      await loadStudent();
      setActiveDialog(null);
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to revoke invitation', 'error');
    }
  };

  const handleRemove = async () => {
    if (!studentId) return;
    try {
      const result = await removeAccess('coordinator-1', studentId);
      await loadStudent();
      setActiveDialog(null);
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to remove access', 'error');
    }
  };

  const handleSimulateActivation = async () => {
    if (!studentId) return;
    try {
      const result = await simulateActivation(studentId);
      await loadStudent();
      setActiveDialog(null);
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to activate account', 'error');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading student details...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/coordinator/access')}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Student Access
          </button>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-700 text-lg mb-2">Student Not Found</p>
            <p className="text-gray-500">The requested student does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/coordinator/access')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Student Access
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
              <p className="text-gray-600 mt-1">
                {student.registerNumber} • {student.department}
              </p>
            </div>
            <StatusBadge status={student.access.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
              <dl className="space-y-3">
                <div><dt className="text-sm font-medium text-gray-500">Full Name</dt><dd className="mt-1 text-sm text-gray-900">{student.name}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Register Number</dt><dd className="mt-1 text-sm text-gray-900">{student.registerNumber}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Email Address</dt><dd className="mt-1 text-sm text-gray-900">{student.email}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Department</dt><dd className="mt-1 text-sm text-gray-900">{student.department}</dd></div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Placement Information</h2>
              <dl className="space-y-3">
                <div><dt className="text-sm font-medium text-gray-500">Company</dt><dd className="mt-1 text-sm text-gray-900">{student.placedCompany}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Role</dt><dd className="mt-1 text-sm text-gray-900">{student.rolePlaced}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Package (LPA)</dt><dd className="mt-1 text-sm text-gray-900">{student.packageLpa}</dd></div>
              </dl>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Portal Access Status</h2>
              <dl className="space-y-3">
                <div><dt className="text-sm font-medium text-gray-500">Current Status</dt><dd className="mt-1"><StatusBadge status={student.access.status} /></dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Invitation Sent</dt><dd className="mt-1 text-sm text-gray-900">{formatDate(student.access.invitationSentAt)}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Activated On</dt><dd className="mt-1 text-sm text-gray-900">{formatDate(student.access.activatedAt)}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Last Login</dt><dd className="mt-1 text-sm text-gray-900">{formatDate(student.access.lastLoginAt)}</dd></div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Management</h2>
              <div className="space-y-3">
                {student.access.status === 'NO_ACCESS' && (
                  <button onClick={() => setActiveDialog('give-access')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Give Access</button>
                )}
                {student.access.status === 'INVITED' && (
                  <>
                    <button onClick={() => setActiveDialog('resend')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Resend Invitation</button>
                    <button onClick={() => setActiveDialog('revoke-invitation')} className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Revoke Invitation</button>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Demo / Mock Only:</p>
                      <button onClick={() => setActiveDialog('simulate-activation')} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm">Simulate Student Activation</button>
                    </div>
                  </>
                )}
                {student.access.status === 'ACTIVE' && (
                  <button onClick={() => setActiveDialog('remove-access')} className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Remove Access</button>
                )}
                {student.access.status === 'REVOKED' && (
                  <button onClick={() => setActiveDialog('give-access')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Give Access Again</button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Access History</h2>
              {student.access.history.length > 0 ? (
                <div className="space-y-3">
                  {student.access.history.slice().reverse().map(entry => (
                    <div key={entry.id} className="flex flex-col text-sm border-l-2 border-gray-200 pl-3">
                      <span className="font-medium text-gray-900">{entry.action}</span>
                      <span className="text-gray-500 text-xs">{formatDate(entry.timestamp)}</span>
                      {entry.actor && <span className="text-gray-400 text-xs">by {entry.actor}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No access history available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={activeDialog === 'give-access'}
        title="Grant Portal Access"
        message={<div className="space-y-2"><p><strong>Student Name:</strong> {student.name}</p><p><strong>Register Number:</strong> {student.registerNumber}</p><p><strong>Email:</strong> {student.email}</p><p className="mt-4 text-gray-600">An invitation will be sent to the student's registered email address.</p></div>}
        confirmLabel="Send Invitation"
        onConfirm={handleGiveAccess}
        onCancel={() => setActiveDialog(null)}
        isDestructive={false}
      />

      <ConfirmDialog
        isOpen={activeDialog === 'resend'}
        title="Resend Invitation"
        message={`Are you sure you want to resend the portal access invitation to ${student.name}?`}
        confirmLabel="Resend Invitation"
        onConfirm={handleResend}
        onCancel={() => setActiveDialog(null)}
        isDestructive={false}
      />

      <ConfirmDialog
        isOpen={activeDialog === 'revoke-invitation'}
        title="Revoke Invitation"
        message={`Are you sure you want to revoke the invitation for ${student.name}? The student will not be able to activate their account.`}
        confirmLabel="Revoke Invitation"
        onConfirm={handleRevoke}
        onCancel={() => setActiveDialog(null)}
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={activeDialog === 'remove-access'}
        title="Remove Portal Access"
        message={<div className="space-y-2"><p><strong>Student Name:</strong> {student.name}</p><p><strong>Register Number:</strong> {student.registerNumber}</p><p><strong>Email:</strong> {student.email}</p><p className="mt-4 text-gray-600">The student will no longer be able to sign in to the placement portal. Their placement records and recruitment history will NOT be deleted.</p></div>}
        confirmLabel="Remove Access"
        onConfirm={handleRemove}
        onCancel={() => setActiveDialog(null)}
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={activeDialog === 'simulate-activation'}
        title="Simulate Student Activation"
        message={<div><p className="text-sm text-amber-600 mb-3"><strong>Demo Only:</strong> This simulates the student activation workflow.</p><p>In a real system, the student would activate their account via email and set their own password. This action will change the status to Active for demonstration purposes.</p></div>}
        confirmLabel="Activate Account"
        onConfirm={handleSimulateActivation}
        onCancel={() => setActiveDialog(null)}
        isDestructive={false}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
    </div>
  );
};
