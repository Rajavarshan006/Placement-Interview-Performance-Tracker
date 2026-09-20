import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlacedStudent } from '../types';
import { getPlacedStudents } from '../services/coordinatorService';
import { StatusBadge } from '../components/StatusBadge';

export const StudentAccessDirectory = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<PlacedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');



  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getPlacedStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const departments = useMemo(() => {
    const depts = new Set(students.map(s => s.department));
    return Array.from(depts).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.registerNumber.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }

    if (departmentFilter !== 'ALL') {
      result = result.filter(s => s.department === departmentFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.access.status === statusFilter);
    }

    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'regno-asc':
        result.sort((a, b) => a.registerNumber.localeCompare(b.registerNumber));
        break;
      case 'regno-desc':
        result.sort((a, b) => b.registerNumber.localeCompare(a.registerNumber));
        break;
    }

    return result;
  }, [students, searchQuery, departmentFilter, statusFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Coordinator Access Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage student access to the placement portal
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, register number or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
            </div>

            <div className="w-full lg:w-48">
              <label htmlFor="department" className="block text-xs font-medium text-slate-500 mb-1">
                Department
              </label>
              <select
                id="department"
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-48">
              <label htmlFor="accessStatus" className="block text-xs font-medium text-slate-500 mb-1">
                Access Status
              </label>
              <select
                id="accessStatus"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="NO_ACCESS">No Access</option>
                <option value="INVITED">Invited</option>
                <option value="ACTIVE">Active</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>

            <div className="w-full lg:w-48">
              <label htmlFor="sortBy" className="block text-xs font-medium text-slate-500 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="name-asc">Name (A - Z)</option>
                <option value="name-desc">Name (Z - A)</option>
                <option value="regno-asc">Register Number (Ascending)</option>
                <option value="regno-desc">Register Number (Descending)</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No students found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs">#</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Register No.</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Access Status</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.registerNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {student.department}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.access.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/coordinator/access/${student.studentId}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
