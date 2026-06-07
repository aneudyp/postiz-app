export const dynamic = 'force-dynamic';
import { AdminTrafficComponent } from '@gitroom/frontend/components/admin/admin-traffic.component';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin · Traffic', description: '' };

export default function Page() {
  return <AdminTrafficComponent />;
}
