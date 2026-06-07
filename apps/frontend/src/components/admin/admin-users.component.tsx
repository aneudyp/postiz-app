'use client';

import { FC, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import clsx from 'clsx';
import dayjs from 'dayjs';

const PLANS = ['', 'FREE', 'STANDARD', 'TEAM', 'PRO', 'ULTIMATE'];

const planColor: Record<string, string> = {
  FREE:     'bg-[#2a2a2a] text-[#888]',
  STANDARD: 'bg-[#1a3a5c] text-[#5aadff]',
  TEAM:     'bg-[#1a3a2a] text-[#4ddb8a]',
  PRO:      'bg-[#3a1a5c] text-[#c084fc]',
  ULTIMATE: 'bg-[#3a2a00] text-[#fbbf24]',
};

const useUsers = (params: { page: number; search: string; plan: string }) => {
  const fetch = useFetch();
  const q = new URLSearchParams({
    page: String(params.page),
    limit: '20',
    ...(params.search ? { search: params.search } : {}),
    ...(params.plan ? { plan: params.plan } : {}),
  });
  return useSWR(`/admin/users?${q}`, async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  }, { revalidateOnFocus: false });
};

const PlanBadge: FC<{ tier?: string }> = ({ tier }) => {
  const t = tier || 'FREE';
  return (
    <span className={clsx('px-[8px] py-[2px] rounded-[4px] text-[11px] font-[600] uppercase', planColor[t] || planColor.FREE)}>
      {t}
    </span>
  );
};

export const AdminUsersComponent: FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [plan, setPlan] = useState('');

  const { data, isLoading } = useUsers({ page, search, plan });

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[20px] font-[600]">Users & Organizations</div>
        {data && (
          <div className="text-[13px] opacity-60">
            {data.total.toLocaleString()} total
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-[10px]">
        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(0); }}
          className="flex gap-[8px]"
        >
          <input
            type="text"
            placeholder="Search email or org name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-[36px] px-[12px] rounded-[6px] text-[13px] bg-newBgColor border border-newTableBorder text-textColor w-[260px] outline-none focus:border-forth"
          />
          <button
            type="submit"
            className="h-[36px] px-[16px] rounded-[6px] bg-forth text-white text-[13px] font-[500] cursor-pointer hover:opacity-90"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }}
              className="h-[36px] px-[12px] rounded-[6px] border border-newTableBorder text-[13px] cursor-pointer hover:bg-newBgColor"
            >
              Clear
            </button>
          )}
        </form>

        <select
          value={plan}
          onChange={(e) => { setPlan(e.target.value); setPage(0); }}
          className="h-[36px] px-[12px] rounded-[6px] text-[13px] bg-newBgColor border border-newTableBorder text-textColor outline-none focus:border-forth cursor-pointer"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>{p || 'All Plans'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingComponent />
      ) : !data?.users?.length ? (
        <div className="text-[14px] opacity-60 py-[24px] text-center border border-newTableBorder rounded-[8px]">
          No users found.
        </div>
      ) : (
        <div className="border border-newTableBorder rounded-[8px] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-[12px] px-[16px] py-[10px] bg-newBgColor text-[11px] uppercase tracking-[0.06em] opacity-60 border-b border-newTableBorder">
            <div>Organization / Email</div>
            <div>Plan</div>
            <div>Channels</div>
            <div>Posts</div>
            <div>Joined</div>
            <div>Last seen</div>
          </div>

          {data.users.map((org: any) => {
            const owner = org.users?.[0]?.user;
            const sub = org.subscription;
            const daysAgo = owner?.lastOnline
              ? Math.floor((Date.now() - new Date(owner.lastOnline).getTime()) / 86400000)
              : null;

            return (
              <div
                key={org.id}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-[12px] px-[16px] py-[12px] border-b border-newTableBorder last:border-b-0 hover:bg-newBgColor transition-colors text-[13px]"
              >
                {/* Org / email */}
                <div className="flex flex-col gap-[2px] min-w-0">
                  <div className="font-[500] truncate">{org.name?.split('###')[0] || '—'}</div>
                  <div className="text-[12px] opacity-60 truncate">{owner?.email || '—'}</div>
                </div>

                {/* Plan */}
                <div className="flex items-center gap-[8px]">
                  <PlanBadge tier={sub?.subscriptionTier} />
                  {sub?.isLifetime && (
                    <span className="text-[10px] bg-[#2a1a00] text-[#fbbf24] px-[6px] py-[1px] rounded-[4px]">
                      LIFETIME
                    </span>
                  )}
                  {org.isTrailing && (
                    <span className="text-[10px] bg-[#1a2a3a] text-[#5aadff] px-[6px] py-[1px] rounded-[4px]">
                      TRIAL
                    </span>
                  )}
                </div>

                {/* Channels */}
                <div className="flex items-center text-textColor">
                  {org._count?.Integration ?? 0}
                </div>

                {/* Posts */}
                <div className="flex items-center text-textColor">
                  {org._count?.post ?? 0}
                </div>

                {/* Joined */}
                <div className="flex items-center opacity-70">
                  {dayjs(org.createdAt).format('MMM D, YYYY')}
                </div>

                {/* Last seen */}
                <div className="flex items-center opacity-70 text-[12px]">
                  {daysAgo === null
                    ? '—'
                    : daysAgo === 0
                    ? 'Today'
                    : daysAgo === 1
                    ? '1d ago'
                    : `${daysAgo}d ago`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-[8px] justify-end text-[13px]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-[32px] px-[12px] rounded-[6px] border border-newTableBorder disabled:opacity-40 cursor-pointer hover:bg-newBgColor disabled:cursor-default"
          >
            ← Prev
          </button>
          <span className="opacity-60">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-[32px] px-[12px] rounded-[6px] border border-newTableBorder disabled:opacity-40 cursor-pointer hover:bg-newBgColor disabled:cursor-default"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
