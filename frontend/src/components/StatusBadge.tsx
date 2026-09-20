import type { AccessStatus } from '../types';

interface StatusBadgeProps {
  status: AccessStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    NO_ACCESS: 'bg-gray-100 text-gray-800',
    INVITED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    REVOKED: 'bg-red-100 text-red-800',
  };

  const labels = {
    NO_ACCESS: 'No Access',
    INVITED: 'Invited',
    ACTIVE: 'Active',
    REVOKED: 'Revoked',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
