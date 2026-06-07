export const dynamic = 'force-dynamic';
import { AdminBillingComponent } from '@gitroom/frontend/components/admin/admin-billing.component';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin · Billing', description: '' };

export default function Page() {
  return <AdminBillingComponent />;
}
