import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export interface UsersListParams {
  page: number;
  limit: number;
  search?: string;
  plan?: string;
}

@Injectable()
export class AdminManagementRepository {
  constructor(
    private _user: PrismaRepository<'user'>,
    private _organization: PrismaRepository<'organization'>,
    private _subscription: PrismaRepository<'subscription'>,
    private _integration: PrismaRepository<'integration'>,
    private _post: PrismaRepository<'post'>
  ) {}

  // ─── Users ───────────────────────────────────────────────────────────────

  async listUsers(params: UsersListParams) {
    const { page, limit, search, plan } = params;
    const skip = page * limit;

    const orgs = await this._organization.model.organization.findMany({
      where: {
        ...(plan
          ? {
              subscription: {
                subscriptionTier: plan as any,
              },
            }
          : {}),
        ...(search
          ? {
              OR: [
                { users: { some: { user: { email: { contains: search, mode: 'insensitive' } } } } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        apiKey: true,
        subscription: {
          select: {
            subscriptionTier: true,
            period: true,
            totalChannels: true,
            isLifetime: true,
            cancelAt: true,
            createdAt: true,
          },
        },
        users: {
          select: {
            role: true,
            disabled: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                providerName: true,
                createdAt: true,
                lastOnline: true,
                ip: true,
                isSuperAdmin: true,
              },
            },
          },
          where: { role: 'SUPERADMIN' },
          take: 1,
        },
        _count: {
          select: {
            Integration: { where: { deletedAt: null, disabled: false } },
            post: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this._organization.model.organization.count({
      where: {
        ...(plan ? { subscription: { subscriptionTier: plan as any } } : {}),
        ...(search
          ? {
              OR: [
                { users: { some: { user: { email: { contains: search, mode: 'insensitive' } } } } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });

    return { users: orgs, total, page, limit };
  }

  async getUserDetail(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscription: true,
        users: {
          select: {
            role: true,
            disabled: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                providerName: true,
                createdAt: true,
                lastOnline: true,
                ip: true,
              },
            },
          },
        },
        _count: {
          select: {
            Integration: true,
            post: true,
          },
        },
      },
    });
  }

  // ─── Billing overview ────────────────────────────────────────────────────

  async getBillingOverview() {
    const tiers = ['FREE', 'STANDARD', 'TEAM', 'PRO', 'ULTIMATE'] as const;

    const [byTier, totalOrgs, recentSignups, activeTrials] = await Promise.all([
      // Subscriptions count per tier
      this._subscription.model.subscription.groupBy({
        by: ['subscriptionTier', 'period'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      // Total organizations
      this._organization.model.organization.count(),
      // Signups last 30 days
      this._organization.model.organization.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Currently in trial
      this._organization.model.organization.count({
        where: { isTrailing: true },
      }),
    ]);

    // Calculate estimated MRR
    const tierPrices: Record<string, { monthly: number; yearly: number }> = {
      FREE:     { monthly: 0,  yearly: 0 },
      STANDARD: { monthly: 29, yearly: Math.round(278 / 12) },
      TEAM:     { monthly: 39, yearly: Math.round(374 / 12) },
      PRO:      { monthly: 49, yearly: Math.round(470 / 12) },
      ULTIMATE: { monthly: 99, yearly: Math.round(950 / 12) },
    };

    let mrr = 0;
    const breakdown = tiers.map((tier) => {
      const monthly = byTier.find(
        (b) => b.subscriptionTier === tier && b.period === 'MONTHLY'
      );
      const yearly = byTier.find(
        (b) => b.subscriptionTier === tier && b.period === 'YEARLY'
      );
      const monthlyCount = monthly?._count._all || 0;
      const yearlyCount = yearly?._count._all || 0;
      const contribution =
        monthlyCount * (tierPrices[tier]?.monthly || 0) +
        yearlyCount * (tierPrices[tier]?.yearly || 0);
      mrr += contribution;
      return {
        tier,
        monthly: monthlyCount,
        yearly: yearlyCount,
        total: monthlyCount + yearlyCount,
        mrr: contribution,
      };
    });

    return { breakdown, mrr, totalOrgs, recentSignups, activeTrials };
  }

  // ─── Traffic / signups over time ─────────────────────────────────────────

  async getTrafficStats(days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [signupsRaw, providerCounts, timezoneCounts] = await Promise.all([
      // Daily signups - use raw query for date truncation
      this._organization.model.organization.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Auth providers
      this._user.model.user.groupBy({
        by: ['providerName'],
        _count: { _all: true },
        orderBy: { _count: { providerName: 'desc' } },
      }),
      // Timezone distribution (proxy for region)
      this._user.model.user.groupBy({
        by: ['timezone'],
        _count: { _all: true },
        orderBy: { _count: { timezone: 'desc' } },
        take: 20,
      }),
    ]);

    // Group by day
    const byDay = new Map<string, number>();
    for (const org of signupsRaw) {
      const day = org.createdAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }
    const dailySignups = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Map timezones to regions
    const regionMap = (tz: number): string => {
      if (tz >= -5 && tz <= 0) return 'Americas (East + UTC)';
      if (tz >= -10 && tz < -5) return 'Americas (West)';
      if (tz >= 1 && tz <= 3) return 'Europe / Africa';
      if (tz >= 4 && tz <= 6) return 'Middle East / South Asia';
      if (tz >= 7 && tz <= 9) return 'East Asia';
      if (tz >= 10 && tz <= 14) return 'Oceania';
      return 'Other';
    };

    const regionCounts = new Map<string, number>();
    for (const t of timezoneCounts) {
      const region = regionMap(t.timezone);
      regionCounts.set(region, (regionCounts.get(region) || 0) + t._count._all);
    }
    const regions = [...regionCounts.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    return {
      dailySignups,
      authProviders: providerCounts.map((p) => ({
        provider: p.providerName,
        count: p._count._all,
      })),
      regions,
    };
  }

  // ─── ENV variables status ────────────────────────────────────────────────

  getEnvStatus() {
    const bool = (v: string | undefined) => !!v && v !== 'false' && v !== '';

    const vars: Array<{ key: string; label: string; configured: boolean; value?: string; sensitive: boolean }> = [
      // Core
      { key: 'DATABASE_URL',           label: 'Database URL',            configured: bool(process.env.DATABASE_URL),           sensitive: true },
      { key: 'REDIS_URL',              label: 'Redis URL',               configured: bool(process.env.REDIS_URL),              sensitive: true },
      { key: 'JWT_SECRET',             label: 'JWT Secret',              configured: bool(process.env.JWT_SECRET),             sensitive: true },
      { key: 'FRONTEND_URL',           label: 'Frontend URL',            configured: bool(process.env.FRONTEND_URL),           sensitive: false, value: process.env.FRONTEND_URL },
      { key: 'NEXT_PUBLIC_BACKEND_URL',label: 'Backend URL (public)',    configured: bool(process.env.NEXT_PUBLIC_BACKEND_URL),sensitive: false, value: process.env.NEXT_PUBLIC_BACKEND_URL },
      // Storage
      { key: 'STORAGE_PROVIDER',       label: 'Storage Provider',        configured: bool(process.env.STORAGE_PROVIDER),       sensitive: false, value: process.env.STORAGE_PROVIDER },
      { key: 'CLOUDFLARE_ACCOUNT_ID',  label: 'Cloudflare R2',           configured: bool(process.env.CLOUDFLARE_ACCOUNT_ID),  sensitive: true },
      // Social platforms
      { key: 'FACEBOOK_APP_ID',        label: 'Facebook / Instagram',    configured: bool(process.env.FACEBOOK_APP_ID),        sensitive: true },
      { key: 'THREADS_APP_ID',         label: 'Threads',                 configured: bool(process.env.THREADS_APP_ID),         sensitive: true },
      { key: 'X_API_KEY',              label: 'X / Twitter',             configured: bool(process.env.X_API_KEY),              sensitive: true },
      { key: 'LINKEDIN_CLIENT_ID',     label: 'LinkedIn',                configured: bool(process.env.LINKEDIN_CLIENT_ID),     sensitive: true },
      { key: 'TIKTOK_CLIENT_ID',       label: 'TikTok',                  configured: bool(process.env.TIKTOK_CLIENT_ID),       sensitive: true },
      { key: 'YOUTUBE_CLIENT_ID',      label: 'YouTube',                 configured: bool(process.env.YOUTUBE_CLIENT_ID),      sensitive: true },
      { key: 'REDDIT_CLIENT_ID',       label: 'Reddit',                  configured: bool(process.env.REDDIT_CLIENT_ID),       sensitive: true },
      { key: 'PINTEREST_CLIENT_ID',    label: 'Pinterest',               configured: bool(process.env.PINTEREST_CLIENT_ID),    sensitive: true },
      { key: 'DISCORD_CLIENT_ID',      label: 'Discord',                 configured: bool(process.env.DISCORD_CLIENT_ID),      sensitive: true },
      { key: 'SLACK_ID',               label: 'Slack',                   configured: bool(process.env.SLACK_ID),               sensitive: true },
      { key: 'MASTODON_CLIENT_ID',     label: 'Mastodon',                configured: bool(process.env.MASTODON_CLIENT_ID),     sensitive: true },
      { key: 'GITHUB_CLIENT_ID',       label: 'GitHub',                  configured: bool(process.env.GITHUB_CLIENT_ID),       sensitive: true },
      // Payments
      { key: 'STRIPE_PUBLISHABLE_KEY', label: 'Stripe',                  configured: bool(process.env.STRIPE_PUBLISHABLE_KEY), sensitive: true },
      // AI
      { key: 'OPENAI_API_KEY',         label: 'OpenAI',                  configured: bool(process.env.OPENAI_API_KEY),         sensitive: true },
      // Email
      { key: 'RESEND_API_KEY',         label: 'Resend (Email)',           configured: bool(process.env.RESEND_API_KEY),         sensitive: true },
      // Misc
      { key: 'DISABLE_REGISTRATION',  label: 'Registration disabled',   configured: bool(process.env.DISABLE_REGISTRATION),   sensitive: false, value: process.env.DISABLE_REGISTRATION || 'false' },
      { key: 'API_LIMIT',             label: 'API Rate Limit (req/hr)', configured: bool(process.env.API_LIMIT),              sensitive: false, value: process.env.API_LIMIT || '30' },
    ];

    return vars.map(({ key, label, configured, sensitive, value }) => ({
      key,
      label,
      configured,
      value: sensitive ? undefined : value,
    }));
  }
}
