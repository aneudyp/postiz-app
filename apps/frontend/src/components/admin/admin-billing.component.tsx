'use client';

import { FC } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import clsx from 'clsx';

const useBilling = () => {
  const fetch = useFetch();
  return useSWR('/admin/billing', async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  }, { revalidateOnFocus: false });
};

const tierColor: Record<string, string> = {
  FREE:     'border-[#444] text-[#888]',
  STANDARD: 'border-[#1d6fa3] text-[#5aadff]',
  TEAM:     'border-[#1a7a40] text-[#4ddb8a]',
  PRO:      'border-[#6b21a8] text-[#c084fc]',
  ULTIMATE: 'border-[#92400e] text-[#fbbf24]',
};

const MetricCard: FC<{ label: string; value: string | number; sub?: string; accent?: boolean }> = ({
  label, value, sub, accent,
}) => (
  <div className={clsx(
    'rounded-[8px] border p-[20px] flex flex-col gap-[6px] bg-newBgColor',
    accent ? 'border-forth' : 'border-newTableBorder'
  )}>
    <div className="text-[12px] opacity-60 uppercase tracking-[0.06em]">{label}</div>
    <div className={clsx('text-[32px] font-[700]', accent && 'text-forth')}>{value}</div>
    {sub && <div className="text-[12px] opacity-50">{sub}</div>}
  </div>
);

export const AdminBillingComponent: FC = () => {
  const { data, isLoading, error } = useBilling();

  if (isLoading) return <LoadingComponent />;
  if (error || !data) return <div className="text-red-400">Failed to load billing data.</div>;

  const totalPaid = data.breakdown
    .filter((b: any) => b.tier !== 'FREE')
    .reduce((sum: number, b: any) => sum + b.total, 0);

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="text-[20px] font-[600]">Billing Overview</div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
        <MetricCard
          label="Est. MRR"
          value={`$${data.mrr.toLocaleString()}`}
          sub="Monthly Recurring Revenue"
          accent
        />
        <MetricCard
          label="Paid Subscribers"
          value={totalPaid.toLocaleString()}
          sub="Active paid plans"
        />
        <MetricCard
          label="Total Organizations"
          value={data.totalOrgs.toLocaleString()}
          sub="All tenants"
        />
        <MetricCard
          label="Active Trials"
          value={data.activeTrials.toLocaleString()}
          sub="Currently trialing"
        />
      </div>

      {/* Signups last 30 days */}
      <div className="rounded-[8px] border border-newTableBorder p-[20px] bg-newBgColor">
        <div className="text-[13px] opacity-60 mb-[4px]">New signups — last 30 days</div>
        <div className="text-[28px] font-[600]">{data.recentSignups.toLocaleString()}</div>
      </div>

      {/* Plan breakdown table */}
      <div className="border border-newTableBorder rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-[12px] px-[16px] py-[10px] bg-newBgColor text-[11px] uppercase tracking-[0.06em] opacity-60 border-b border-newTableBorder">
          <div>Plan</div>
          <div className="text-right">Monthly</div>
          <div className="text-right">Yearly</div>
          <div className="text-right">Total</div>
          <div className="text-right">Est. MRR</div>
        </div>

        {data.breakdown.map((row: any) => (
          <div
            key={row.tier}
            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-[12px] px-[16px] py-[12px] border-b border-newTableBorder last:border-b-0 text-[14px]"
          >
            <div>
              <span className={clsx(
                'px-[8px] py-[2px] rounded-[4px] text-[11px] font-[700] uppercase border',
                tierColor[row.tier]
              )}>
                {row.tier}
              </span>
            </div>
            <div className="text-right opacity-80">{row.monthly.toLocaleString()}</div>
            <div className="text-right opacity-80">{row.yearly.toLocaleString()}</div>
            <div className="text-right font-[500]">{row.total.toLocaleString()}</div>
            <div className={clsx(
              'text-right font-[600]',
              row.mrr > 0 ? 'text-[#4ddb8a]' : 'opacity-40'
            )}>
              {row.mrr > 0 ? `$${row.mrr.toLocaleString()}` : '—'}
            </div>
          </div>
        ))}

        {/* Totals row */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-[12px] px-[16px] py-[12px] bg-newBgColor border-t border-newTableBorder text-[14px] font-[700]">
          <div className="opacity-60">TOTAL</div>
          <div className="text-right">
            {data.breakdown.reduce((s: number, b: any) => s + b.monthly, 0).toLocaleString()}
          </div>
          <div className="text-right">
            {data.breakdown.reduce((s: number, b: any) => s + b.yearly, 0).toLocaleString()}
          </div>
          <div className="text-right">
            {data.breakdown.reduce((s: number, b: any) => s + b.total, 0).toLocaleString()}
          </div>
          <div className="text-right text-[#4ddb8a]">${data.mrr.toLocaleString()}</div>
        </div>
      </div>

      <div className="text-[11px] opacity-40">
        * MRR is estimated based on plan prices. Yearly plans are divided by 12. Does not account for discounts, refunds, or Stripe fees.
      </div>
    </div>
  );
};
