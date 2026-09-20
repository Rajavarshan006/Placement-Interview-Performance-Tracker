import type { AccessStatus } from '../types';

interface StatusBadgeProps {
  status: AccessStatus;
  size?: 'sm' | 'lg';
}

export const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const isLg = size === 'lg';
  const padding = isLg ? 'px-3 py-1.5' : 'px-2.5 py-1';
  const textSize = isLg ? 'text-sm' : 'text-xs';
  const iconSize = isLg ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const config = {
    NO_ACCESS: {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      label: 'No Access'
    },
    INVITED: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: 'Invited'
    },
    ACTIVE: {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      label: 'Active'
    },
    REVOKED: {
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={iconSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
        </svg>
      ),
      label: 'Revoked'
    }
  };

  const { color, icon, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${color} ${padding} ${textSize}`}>
      {icon}
      {label}
    </span>
  );
};
