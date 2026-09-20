import type { PlacedStudent } from '../types';

interface AccessTableProps {
  students: PlacedStudent[];
  onGiveAccess: (studentId: string) => void;
  onRemoveAccess: (studentId: string) => void;
  isLoading: boolean;
}

/**
 * Table component displaying placed students and their access status
 *
 * Provides action buttons for granting or revoking access based on current status.
 */
export const AccessTable = ({
  students,
  onGiveAccess,
  onRemoveAccess,
  isLoading,
}: AccessTableProps) => {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 text-5xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Placed Students
        </h3>
        <p className="text-gray-500">
          There are no placed students to manage at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Register Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Student Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Package (LPA)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Access Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.registerNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.placedCompany}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {student.rolePlaced}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.packageLpa.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.accessStatus === 'ACTIVE' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      No Access
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {student.accessStatus === 'ACTIVE' ? (
                    <button
                      onClick={() => onRemoveAccess(student.studentId)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Remove access for ${student.name}`}
                    >
                      Remove Access
                    </button>
                  ) : (
                    <button
                      onClick={() => onGiveAccess(student.studentId)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-900 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Give access to ${student.name}`}
                    >
                      Give Access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
