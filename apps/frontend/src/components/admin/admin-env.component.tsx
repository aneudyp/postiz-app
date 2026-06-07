'use client';

import { FC } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import clsx from 'clsx';

interface EnvVar {
  key: string;
  label: string;
  configured: boolean;
  value?: string;
}

const groups = [
  { title: 'Core Infrastructure', keys: ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'FRONTEND_URL', 'NEXT_PUBLIC_BACKEND_URL'] },
  { title: 'Storage', keys: ['STORAGE_PROVIDER', 'CLOUDFLARE_ACCOUNT_ID'] },
  { title: 'Social Platforms', keys: ['FACEBOOK_APP_ID', 'THREADS_APP_ID', 'X_API_KEY', 'LINKEDIN_CLIENT_ID', 'TIKTOK_CLIENT_ID', 'YOUTUBE_CLIENT_ID', 'REDDIT_CLIENT_ID', 'PINTEREST_CLIENT_ID', 'DISCORD_CLIENT_ID', 'SLACK_ID', 'MASTODON_CLIENT_ID', 'GITHUB_CLIENT_ID'] },
  { title: 'Payments', keys: ['STRIPE_PUBLISHABLE_KEY'] },
  { title: 'AI & Email', keys: ['OPENAI_API_KEY', 'RESEND_API_KEY'] },
  { title: 'Configuration', keys: ['DISABLE_REGISTRATION', 'API_LIMIT'] },
];

const useEnv = () => {
  const fetch = useFetch();
  return useSWR('/admin/env', async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return res.json() as Promise<EnvVar[]>;
  }, { revalidateOnFocus: false });
};

const StatusPill: FC<{ configured: boolean }> = ({ configured }) => (
  <span className={clsx(
    'inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full text-[11px] font-[600]',
    configured
      ? 'bg-[#0d2b1a] text-[#4ddb8a]'
      : 'bg-[#2b0d0d] text-[#f87171]'
  )}>
    <span className={clsx('w-[6px] h-[6px] rounded-full', configured ? 'bg-[#4ddb8a]' : 'bg-[#f87171]')} />
    {configured ? 'Configured' : 'Missing'}
  </span>
);

export const AdminEnvComponent: FC = () => {
  const { data, isLoading, error } = useEnv();

  if (isLoading) return <LoadingComponent />;
  if (error || !data) return <div className="text-red-400">Failed to load environment status.</div>;

  const byKey = new Map(data.map((v) => [v.key, v]));
  const configured = data.filter((v) => v.configured).length;
  const missing = data.filter((v) => !v.configured).length;

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[20px] font-[600]">Environment Variables</div>
        <div className="text-[13px] opacity-60">
          Read-only · Secrets are never exposed
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-[12px]">
        <div className="rounded-[8px] border border-newTableBorder p-[16px] bg-newBgColor">
          <div className="text-[11px] opacity-50 uppercase tracking-[0.06em]">Total</div>
          <div className="text-[28px] font-[700]">{data.length}</div>
        </div>
        <div className="rounded-[8px] border border-[#1a7a40] p-[16px] bg-newBgColor">
          <div className="text-[11px] opacity-50 uppercase tracking-[0.06em]">Configured</div>
          <div className="text-[28px] font-[700] text-[#4ddb8a]">{configured}</div>
        </div>
        <div className="rounded-[8px] border border-[#7a1a1a] p-[16px] bg-newBgColor">
          <div className="text-[11px] opacity-50 uppercase tracking-[0.06em]">Missing</div>
          <div className="text-[28px] font-[700] text-[#f87171]">{missing}</div>
        </div>
      </div>

      {/* Groups */}
      {groups.map((group) => {
        const vars = group.keys.map((k) => byKey.get(k)).filter(Boolean) as EnvVar[];
        if (!vars.length) return null;
        return (
          <div key={group.title} className="border border-newTableBorder rounded-[8px] overflow-hidden">
            {/* Group header */}
            <div className="px-[16px] py-[10px] bg-newBgColor border-b border-newTableBorder flex items-center justify-between">
              <div className="text-[13px] font-[600]">{group.title}</div>
              <div className="text-[11px] opacity-50">
                {vars.filter((v) => v.configured).length} / {vars.length} configured
              </div>
            </div>

            {/* Vars */}
            {vars.map((v) => (
              <div
                key={v.key}
                className="grid grid-cols-[2fr_1fr_1.5fr] gap-[12px] px-[16px] py-[12px] border-b border-newTableBorder last:border-b-0 text-[13px] items-center"
              >
                {/* Key + label */}
                <div className="flex flex-col gap-[2px]">
                  <div className="font-[500]">{v.label}</div>
                  <div className="font-mono text-[11px] opacity-50">{v.key}</div>
                </div>

                {/* Status */}
                <div><StatusPill configured={v.configured} /></div>

                {/* Value (non-sensitive only) */}
                <div className="font-mono text-[12px] opacity-70 truncate">
                  {v.value
                    ? <span className="bg-newBgColor border border-newTableBorder rounded-[4px] px-[8px] py-[2px]">{v.value}</span>
                    : v.configured
                    ? <span className="opacity-40">●●●●●●●●●●●● (secret)</span>
                    : <span className="opacity-30 italic">not set</span>
                  }
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="text-[11px] opacity-30 text-center">
        Sensitive variables (API keys, secrets) are never returned by the server. Only their presence is shown.
      </div>
    </div>
  );
};
