export const dynamic = 'force-dynamic';
import { AdminEnvComponent } from '@gitroom/frontend/components/admin/admin-env.component';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin · Environment', description: '' };

export default function Page() {
  return <AdminEnvComponent />;
}
