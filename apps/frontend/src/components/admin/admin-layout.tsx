'use client';

import { FC, ReactNode } from 'react';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  {
    label: 'Overview',
    path: '/admin/stats',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Billing',
    path: '/admin/billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Traffic',
    path: '/admin/traffic',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Environment',
    path: '/admin/env',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
  {
    label: 'Errors',
    path: '/admin/errors',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export const AdminLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const user = useUser();
  const pathname = usePathname();

  if (!user?.isSuperAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center text-textColor">
        You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 text-textColor">
      {/* Sidebar */}
      <aside className="w-[200px] min-w-[200px] border-r border-newTableBorder bg-newBgColor flex flex-col gap-[4px] p-[12px]">
        <div className="text-[11px] uppercase tracking-[0.08em] opacity-50 px-[8px] pb-[8px] pt-[4px] font-[600]">
          Admin
        </div>
        {navItems.map((item) => {
          const active = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              href={item.path}
              className={clsx(
                'flex items-center gap-[8px] px-[8px] py-[7px] rounded-[6px] text-[13px] font-[500] transition-colors',
                active
                  ? 'bg-forth text-white'
                  : 'text-textColor hover:bg-newBgColorInner'
              )}
            >
              <span className="opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-[24px] bg-newBgColorInner">
        {children}
      </main>
    </div>
  );
};
