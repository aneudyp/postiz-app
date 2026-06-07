'use client';

import { FC, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import clsx from 'clsx';

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

const useTraffic = (days: number) => {
  const fetch = useFetch();
  return useSWR(`/admin/traffic?days=${days}`, async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  }, { revalidateOnFocus: false });
};

const providerColor: Record<string, string> = {
  LOCAL:    '#5aadff',
  GOOGLE:   '#ea4335',
  GITHUB:   '#c084fc',
  FARCASTER:'#8b5cf6',
  WALLET:   '#fbbf24',
  GENERIC:  '#4ddb8a',
};

/* Minimal bar-chart built with divs — no charting lib needed */
const MiniBarChart: FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
  if (!data.length) return <div className="opacity-40 text-[13px]">No data</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-[3px] h-[80px] w-full">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-[2px] group relative">
          <div
            className="w-full rounded-t-[2px] bg-forth opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ height: `${Math.max(4, (d.count / max) * 72)}px` }}
          />
          {/* tooltip */}
          <div className="absolute bottom-full mb-[4px] hidden group-hover:flex bg-newBgColor border border-newTableBorder rounded-[4px] px-[8px] py-[4px] text-[11px] whitespace-nowrap z-10 pointer-events-none">
            {d.date}: <span className="font-[600] ml-[4px]">{d.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const HorizBar: FC<{ label: string; count: number; max: number; color: string }> = ({
  label, count, max, color,
}) => (
  <div className="flex items-center gap-[10px] text-[13px]">
    <div className="w-[130px] truncate opacity-80 text-right text-[12px]">{label}</div>
    <div className="flex-1 bg-newBgColor rounded-full h-[8px] overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}
      />
    </div>
    <div className="w-[40px] text-right font-[600] text-[12px]">{count.toLocaleString()}</div>
  </div>
);

export const AdminTrafficComponent: FC = () => {
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useTraffic(days);

  if (isLoading) return <LoadingComponent />;
  if (error || !data) return <div className="text-red-400">Failed to load traffic data.</div>;

  const totalSignups = data.dailySignups.reduce((s: number, d: any) => s + d.count, 0);
  const maxProvider = Math.max(...data.authProviders.map((p: any) => p.count), 1);
  const maxRegion = Math.max(...data.regions.map((r: any) => r.count), 1);

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[20px] font-[600]">Traffic & Signups</div>
        <div className="flex gap-[6px]">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={clsx(
                'h-[30px] px-[12px] rounded-[6px] text-[12px] border cursor-pointer transition-colors',
                days === p.days
                  ? 'bg-forth text-white border-forth'
                  : 'border-newTableBorder hover:bg-newBgColor'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-[12px]">
        <div className="rounded-[8px] border border-newTableBorder p-[16px] bg-newBgColor">
          <div className="text-[11px] opacity-50 uppercase tracking-[0.06em]">New orgs ({days}d)</div>
          <div className="text-[28px] font-[700] text-forth">{totalSignups.toLocaleString()}</div>
        </div>
        <div className="rounded-[8px] border border-newTableBorder p-[16px] bg-newBgColor">
          <div className="text-[11px] opacity-50 uppercase tracking-[0.06em]">Daily avg</div>
          <div className="text-[28px] font-[700]">
            {(totalSignups / days).toFixed(1)}
          </div>
        </div>
        <div className="rounded-[8px] border border-newTableBorder p-[16px] bg-newBgColor">
          <div className="text-[11px] opacity-50 uppercase tracking-[0.06em]">Auth providers</div>
          <div className="text-[28px] font-[700]">{data.authProviders.length}</div>
        </div>
      </div>

      {/* Signups chart */}
      <div className="rounded-[8px] border border-newTableBorder p-[20px] bg-newBgColor">
        <div className="text-[13px] font-[500] mb-[16px]">Daily signups</div>
        <MiniBarChart data={data.dailySignups} />
        {data.dailySignups.length > 0 && (
          <div className="flex justify-between mt-[8px] text-[10px] opacity-40">
            <span>{data.dailySignups[0]?.date}</span>
            <span>{data.dailySignups[data.dailySignups.length - 1]?.date}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {/* Auth providers */}
        <div className="rounded-[8px] border border-newTableBorder p-[20px] bg-newBgColor flex flex-col gap-[10px]">
          <div className="text-[13px] font-[500] mb-[4px]">Auth Providers</div>
          {data.authProviders.map((p: any) => (
            <HorizBar
              key={p.provider}
              label={p.provider}
              count={p.count}
              max={maxProvider}
              color={providerColor[p.provider] || '#888'}
            />
          ))}
        </div>

        {/* Regions (timezone-based) */}
        <div className="rounded-[8px] border border-newTableBorder p-[20px] bg-newBgColor flex flex-col gap-[10px]">
          <div className="text-[13px] font-[500] mb-[4px]">Regions (by timezone)</div>
          {data.regions.length === 0 ? (
            <div className="opacity-40 text-[13px]">No data</div>
          ) : (
            data.regions.map((r: any, i: number) => (
              <HorizBar
                key={r.region}
                label={r.region}
                count={r.count}
                max={maxRegion}
                color={`hsl(${(i * 47) % 360}, 60%, 55%)`}
              />
            ))
          )}
          <div className="text-[11px] opacity-40 mt-[4px]">
            Based on user timezone settings
          </div>
        </div>
      </div>
    </div>
  );
};
