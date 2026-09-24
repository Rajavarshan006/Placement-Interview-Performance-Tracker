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
    <>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/coordinator/access')}
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Student Access
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold tracking-tight">
              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <p className="text-slate-500 mt-1">
                {student.registerNumber} <span className="mx-1">•</span> {student.department}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <StatusBadge status={student.access.status} size="lg" />
            <span className="text-xs text-slate-500">
              {student.access.status === 'NO_ACCESS' && 'Student does not have portal access'}
              {student.access.status === 'INVITED' && 'Invitation sent, pending activation'}
              {student.access.status === 'ACTIVE' && 'Student has active portal access'}
              {student.access.status === 'REVOKED' && 'Portal access has been revoked'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Student Information</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Full Name</div>
                    <div className="text-sm font-medium text-slate-900">{student.name}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" /></svg>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Register Number</div>
                    <div className="text-sm font-medium text-slate-900">{student.registerNumber}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Email Address</div>
                    <div className="text-sm font-medium text-slate-900">{student.email}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Department</div>
                    <div className="text-sm font-medium text-slate-900">{student.department}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Placement Information</h2>
            </div>
            <div className="p-5 space-y-6">
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Company</div>
                  <div className="text-sm font-medium text-slate-900">{student.placedCompany || '—'}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v3.659M15 6.75V3" /></svg>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Role</div>
                  <div className="text-sm font-medium text-slate-900">{student.rolePlaced || '—'}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Package (LPA)</div>
                  <div className="text-sm font-medium text-slate-900">{student.packageLpa || '—'}</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50/50 rounded-lg flex items-start gap-2 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                <p className="text-xs text-blue-700 font-medium">Placement information is read-only and does not affect portal access.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Portal Access Status</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span className="text-sm">Current Status</span>
                  </div>
                  <div><StatusBadge status={student.access.status} /></div>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <span className="text-sm">Invitation Sent</span>
                  </div>
                  <div className="text-sm text-slate-900">{formatDate(student.access.invitationSentAt)}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <span className="text-sm">Activated On</span>
                  </div>
                  <div className="text-sm text-slate-900">{formatDate(student.access.activatedAt)}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span className="text-sm">Last Login</span>
                  </div>
                  <div className="text-sm text-slate-900">{formatDate(student.access.lastLoginAt)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Access Management</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {student.access.status === 'NO_ACCESS' && (
                  <>
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                      <div>
                        <p className="font-semibold text-sm mb-1">This student does not have access to the placement portal.</p>
                        <p className="text-xs text-blue-700/80">An invitation will be sent to the student's registered email address with a secure activation link.</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveDialog('give-access')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                      Give Access
                    </button>
                  </>
                )}
                {student.access.status === 'INVITED' && (
                  <div className="space-y-3">
                    <button onClick={() => setActiveDialog('resend')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                      Resend Invitation
                    </button>
                    <button onClick={() => setActiveDialog('revoke-invitation')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors">
                      Revoke Invitation
                    </button>
                    <div className="pt-4 mt-2 border-t border-slate-100">
                      <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Demo / Mock Only</p>
                        <button onClick={() => setActiveDialog('simulate-activation')} className="w-full px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 font-medium text-sm transition-colors">Simulate Student Activation</button>
                      </div>
                    </div>
                  </div>
                )}
                {student.access.status === 'ACTIVE' && (
                  <button onClick={() => setActiveDialog('remove-access')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors">
                    Remove Access
                  </button>
                )}
                {student.access.status === 'REVOKED' && (
                  <button onClick={() => setActiveDialog('give-access')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                    Give Access Again
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Access History</h2>
            </div>
            <div className="p-5">
              {student.access.history.length > 0 ? (
                <div className="space-y-4">
                  {student.access.history.slice().reverse().map((entry, index, array) => (
                    <div key={entry.id} className="relative pl-6">
                      {/* Timeline line */}
                      {index !== array.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-100"></div>
                      )}
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-slate-50 border-[3px] border-white shadow-[0_0_0_1px_rgba(203,213,225,1)] rounded-full flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{entry.action}</span>
                        <div className="flex items-center text-xs text-slate-500 mt-0.5">
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-sm font-medium">No access history available.</p>
                  <p className="text-xs text-slate-400 mt-1">Actions taken on this account will appear here.</p>
                </div>
              )}
            </div>
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
    </>
  );
};
