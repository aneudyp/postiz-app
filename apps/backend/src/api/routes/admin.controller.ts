import {
  Controller,
  Get,
  HttpException,
  Query,
} from '@nestjs/common';
import { GetUserFromRequest } from '@gitroom/nestjs-libraries/user/user.from.request';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ErrorsService } from '@gitroom/nestjs-libraries/database/prisma/errors/errors.service';
import { AdminStatsService } from '@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.service';
import { AdminManagementRepository } from '@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-management.repository';
import dayjs from 'dayjs';

@ApiTags('Admin')
@Controller('/admin')
export class AdminController {
  constructor(
    private _errorsService: ErrorsService,
    private _adminStatsService: AdminStatsService,
    private _adminManagement: AdminManagementRepository
  ) {}

  private assertSuperAdmin(user: User) {
    if (!user?.isSuperAdmin) {
      throw new HttpException('Unauthorized', 400);
    }
  }

  @Get('/errors')
  async listErrors(
    @GetUserFromRequest() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platform') platform?: string,
    @Query('email') email?: string,
    @Query('unknownFirst') unknownFirst?: string
  ) {
    this.assertSuperAdmin(user);
    return this._errorsService.listErrors({
      page: page ? parseInt(page, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
      platform: platform || undefined,
      email: email || undefined,
      unknownFirst: unknownFirst === 'true' || unknownFirst === '1',
    });
  }

  @Get('/errors/platforms')
  async listPlatforms(@GetUserFromRequest() user: User) {
    this.assertSuperAdmin(user);
    return this._errorsService.listPlatforms();
  }

  @Get('/stats')
  async getStats(
    @GetUserFromRequest() user: User,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('unknownOnly') unknownOnly?: string
  ) {
    this.assertSuperAdmin(user);

    const fromDate = from ? dayjs(from) : dayjs().subtract(30, 'day');
    const toDate = to ? dayjs(to) : dayjs();

    return this._adminStatsService.getStats({
      from: fromDate.startOf('day').toDate(),
      to: toDate.endOf('day').toDate(),
      unknownOnly: unknownOnly === 'true' || unknownOnly === '1',
    });
  }

  // ─── Users Management ────────────────────────────────────────────────────

  @Get('/users')
  async listUsers(
    @GetUserFromRequest() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('plan') plan?: string
  ) {
    this.assertSuperAdmin(user);
    return this._adminManagement.listUsers({
      page: page ? parseInt(page, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
      search: search || undefined,
      plan: plan || undefined,
    });
  }

  @Get('/users/:id')
  async getUserDetail(
    @GetUserFromRequest() user: User,
    @Query('id') id?: string
  ) {
    this.assertSuperAdmin(user);
    return this._adminManagement.getUserDetail(id || '');
  }

  // ─── Billing Overview ────────────────────────────────────────────────────

  @Get('/billing')
  async getBilling(@GetUserFromRequest() user: User) {
    this.assertSuperAdmin(user);
    return this._adminManagement.getBillingOverview();
  }

  // ─── Traffic / Signups ───────────────────────────────────────────────────

  @Get('/traffic')
  async getTraffic(
    @GetUserFromRequest() user: User,
    @Query('days') days?: string
  ) {
    this.assertSuperAdmin(user);
    return this._adminManagement.getTrafficStats(
      days ? parseInt(days, 10) : 30
    );
  }

  // ─── ENV Status ──────────────────────────────────────────────────────────

  @Get('/env')
  async getEnv(@GetUserFromRequest() user: User) {
    this.assertSuperAdmin(user);
    return this._adminManagement.getEnvStatus();
  }
}
